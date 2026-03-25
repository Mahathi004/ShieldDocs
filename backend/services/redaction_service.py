"""
Redaction Service
Handles text redaction with PII detection
"""

import re
from typing import Dict, List


class RedactionService:
    """Service for redacting personal information from text"""
    
    PII_PATTERNS = {
        "EMAIL": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "PHONE": r'\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        "SSN": r'\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b',
        "CREDIT_CARD": r'\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b',
        "DATE": r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b',
        "IP_ADDRESS": r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
    }
    
    ENTITY_LABELS = {
        "EMAIL": "Email Address",
        "PHONE": "Phone Number",
        "SSN": "Social Security Number",
        "CREDIT_CARD": "Credit Card Number",
        "DATE": "Date",
        "IP_ADDRESS": "IP Address",
    }
    
    def __init__(self):
        self.model = None
        self.model_loaded = False
    
    def _load_ner_model(self):
        """Lazy load the NER model from HuggingFace"""
        if not self.model_loaded:
            try:
                from transformers import pipeline
                self.model = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")
                self.model_loaded = True
            except Exception as e:
                print(f"Error loading NER model: {e}")
                self.model = None
                self.model_loaded = False
    
    def _detect_pii_regex(self, text: str) -> List[Dict]:
        entities = []
        for pii_type, pattern in self.PII_PATTERNS.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                entities.append({
                    "type": self.ENTITY_LABELS.get(pii_type, pii_type),
                    "value": match.group(),
                    "start": match.start(),
                    "end": match.end()
                })
        return entities
    
    def _detect_pii_ner(self, text: str) -> List[Dict]:
        """Detect person names using HuggingFace NER model"""
        entities = []
        
        # Lazy load the model
        self._load_ner_model()
        
        if self.model is None:
            return entities
        
        try:
            # Create normalized copy of text for NER (capitalize each word)
            # This helps NER detect lowercase names like "mahathi", "arun", etc.
            normalized_text = " ".join(word.capitalize() for word in text.split())
            
            # Run NER on the normalized text
            ner_results = self.model(normalized_text)
            
            # Filter for PERSON entities and avoid duplicates
            seen_values = set()
            for entity in ner_results:
                if entity["entity_group"] == "PER":
                    # Get the value from normalized text
                    normalized_value = normalized_text[entity["start"]:entity["end"]]
                    
                    # Skip if we've already seen this value (case-insensitive check)
                    value_lower = normalized_value.lower()
                    if value_lower in seen_values:
                        continue
                    seen_values.add(value_lower)
                    
                    # Find the position in original text (case-insensitive search)
                    # This ensures we redact the correct text in original
                    original_start = text.lower().find(value_lower)
                    
                    if original_start != -1:
                        original_end = original_start + len(normalized_value)
                        original_value = text[original_start:original_end]
                        
                        entities.append({
                            "type": "Person Name",
                            "value": original_value,
                            "start": original_start,
                            "end": original_end,
                            "score": entity["score"]
                        })
        except Exception as e:
            print(f"Error running NER: {e}")
        
        return entities
    
    def _filter_overlapping_entities(self, entities: List[Dict]) -> List[Dict]:
        """Filter out overlapping entities, keeping only the longer spans"""
        if not entities:
            return entities
        
        # Sort entities by start position
        sorted_entities = sorted(entities, key=lambda x: x["start"])
        
        filtered = []
        for i, entity in enumerate(sorted_entities):
            is_overlapping = False
            for j in range(i + 1, len(sorted_entities)):
                other = sorted_entities[j]
                # Check if current entity overlaps with any later entity
                if entity["start"] < other["end"] and entity["end"] > other["start"]:
                    # If other entity is longer, mark current as overlapping
                    if (other["end"] - other["start"]) > (entity["end"] - entity["start"]):
                        is_overlapping = True
                        break
            
            if not is_overlapping:
                filtered.append(entity)
        
        return filtered
    
    def _merge_entities(self, regex_entities: List[Dict], ner_entities: List[Dict]) -> List[Dict]:
        """Merge regex and NER entities, avoiding duplicates and overlapping spans"""
        merged = list(regex_entities)
        
        # Use lowercase for comparison to detect duplicates case-insensitively
        seen_values = set(e["value"].lower() for e in regex_entities)
        
        # First, remove duplicate NER entities among themselves
        unique_ner_entities = []
        seen_ner_values = set()
        for ner_ent in ner_entities:
            ner_value_lower = ner_ent["value"].lower()
            if ner_value_lower not in seen_ner_values:
                seen_ner_values.add(ner_value_lower)
                unique_ner_entities.append(ner_ent)
        
        # Add NER entities that don't overlap with regex entities and aren't duplicates
        for ner_ent in unique_ner_entities:
            is_duplicate = False
            ner_value_lower = ner_ent["value"].lower()
            
            # Check for overlap with regex entities
            for reg_ent in regex_entities:
                if (ner_ent["start"] < reg_ent["end"] and ner_ent["end"] > reg_ent["start"]):
                    is_duplicate = True
                    break
            
            # Check for duplicate value (case-insensitive)
            if ner_value_lower not in seen_values and not is_duplicate:
                merged.append(ner_ent)
                seen_values.add(ner_value_lower)
        
        # Filter overlapping entities - keep longer spans
        merged = self._filter_overlapping_entities(merged)
        
        # Sort by start position
        return sorted(merged, key=lambda x: x["start"])
    
    def _get_replacement(self, entity_type: str, mode: str) -> str:
        if mode == "redacted":
            return "[REDACTED]"
        elif mode == "mask":
            return "XXXXX"
        elif mode == "tag":
            type_to_tag = {
                "Email Address": "<EMAIL>",
                "Phone Number": "<PHONE>",
                "Social Security Number": "<SSN>",
                "Credit Card Number": "<CREDIT_CARD>",
                "Date": "<DATE>",
                "IP Address": "<IP>",
                "Person Name": "<PERSON>",
            }
            return type_to_tag.get(entity_type, "<REDACTED>")
        return "[REDACTED]"
    
    def redact_text(self, text: str, mode: str = "redacted", use_ner: bool = False) -> Dict:
        if not text:
            return {"original_text": "", "redacted_text": "", "entities_detected": []}
        
        # Detect entities using regex
        regex_entities = self._detect_pii_regex(text)
        
        # Detect entities using NER (for person names)
        ner_entities = []
        if use_ner:
            ner_entities = self._detect_pii_ner(text)
        
        # Merge regex and NER entities
        entities = self._merge_entities(regex_entities, ner_entities)
        
        redacted_text = text
        entities_sorted = sorted(entities, key=lambda x: x["start"], reverse=True)
        
        for entity in entities_sorted:
            replacement = self._get_replacement(entity["type"], mode)
            redacted_text = redacted_text[:entity["start"]] + replacement + redacted_text[entity["end"]:]
        
        detected = [{"type": e["type"], "value": e["value"]} for e in entities]
        
        return {
            "original_text": text,
            "redacted_text": redacted_text,
            "entities_detected": detected
        }
    
    def get_supported_entity_types(self) -> List[str]:
        return list(self.ENTITY_LABELS.values())

    def apply_pdf_redactions(self, file_path: str, redactions: list, document_rotation: int = 0) -> str:
        """
        Apply real PDF redactions using PyMuPDF
        
        Args:
            file_path: Path to input PDF (e.g. 'uploads/sample.pdf')
            redactions: List of {'page':1, 'x1':120, 'y1':450, 'x2':210, 'y2':470}
            document_rotation: Degrees to arbitrarily rotate the document before redacting
        
        Returns:
            Path to redacted PDF (e.g. 'redacted_output/sample_redacted_uuid.pdf')
        """
        import fitz  # PyMuPDF
        import uuid
        import os
        
        # Open input PDF
        doc = fitz.open(file_path)
        
        # If the user rotated the document in the UI, apply it permanently to the PDF
        if document_rotation:
            for page in doc:
                page.set_rotation((page.rotation + document_rotation) % 360)
        
        # Apply redactions per page based on drawing type
        for r in redactions:
            page_num = r['page'] - 1  # 1-based to 0-based
            if page_num < len(doc):
                page = doc[page_num]
                rect = fitz.Rect(r['x1'], r['y1'], r['x2'], r['y2'])
                rtype = r.get('type', 'redact')
                
                print(f"Adding redaction on page {page_num+1} with rect: {rect} and type: {rtype}")
                
                # Fetch average color around rect to camouflage
                fill_color = (1, 1, 1)
                text_color = (0, 0, 0)
                try:
                    pix = page.get_pixmap(clip=rect, matrix=fitz.Matrix(0.2, 0.2))
                    samples = pix.samples
                    if samples:
                        if pix.n >= 3:
                            avg_r = sum(samples[0::pix.n]) / (len(samples) // pix.n)
                            avg_g = sum(samples[1::pix.n]) / (len(samples) // pix.n)
                            avg_b = sum(samples[2::pix.n]) / (len(samples) // pix.n)
                            fill_color = (avg_r/255.0, avg_g/255.0, avg_b/255.0)
                        else:
                            avg_v = sum(samples[0::pix.n]) / (len(samples) // pix.n)
                            fill_color = (avg_v/255.0, avg_v/255.0, avg_v/255.0)
                except Exception as e:
                    print("Color extraction error:", e)
                
                # Calculate luminance to decide text color
                luminance = 0.299 * fill_color[0] + 0.587 * fill_color[1] + 0.114 * fill_color[2]
                text_color = (0, 0, 0) if luminance > 0.5 else (1, 1, 1)
                
                if rtype == "redact":
                    page.add_redact_annot(rect, fill=(0, 0, 0))
                elif rtype == "xxxx":
                    page.add_redact_annot(rect, text="XXXXX", fill=fill_color, text_color=text_color, align=1)
                elif rtype == "tag":
                    page.add_redact_annot(rect, text="<REDACTED>", fill=fill_color, text_color=text_color, align=1)
                else:
                    page.add_redact_annot(rect, fill=(0, 0, 0))
        
        # Apply redactions after adding all annotations across all pages
        for page in doc:
            page.apply_redactions()
        
        # Generate unique output filename
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_filename = f"{base_name}_redacted_{uuid.uuid4().hex[:8]}.pdf"
        
        # Ensure output directory exists
        os.makedirs("redacted_output", exist_ok=True)
        
        output_path = os.path.join("redacted_output", output_filename)
        
        # Save redacted PDF
        doc.save(output_path)
        doc.close()
        
        return output_filename
