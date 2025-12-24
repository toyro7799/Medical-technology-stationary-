import { CurriculumData } from './types';

export const DEFAULT_ADMIN_PASS = "2182000ali";

export const YEARS = ["Year 1", "Year 2", "Year 3", "Year 4"];

// Helper to get semesters based on year
export const getSemestersForYear = (year: string): string[] => {
  switch (year) {
    case "Year 1":
      return ["General"]; // Year 1 has no specific semester division in the prompt, using 'General' as the key.
    case "Year 2":
      return ["Semester 3", "Semester 4"];
    case "Year 3":
      return ["Semester 5", "Semester 6"];
    case "Year 4":
      return ["Semester 7", "Semester 8"];
    default:
      return [];
  }
};

// Full Curriculum Data Structure based on prompt
export const CURRICULUM: CurriculumData = {
  "Year 1": {
    "General Foundation": [
      "Anatomy", "Computer", "General Biology", "General Chemistry", "Physics", "Physiology", "Statistics"
    ]
  },
  "Year 2": {
    "Dental": ["Head and Neck Dental Anatomy", "Basic Immunology", "Dental Materials", "Dental Morphology I"],
    "Genetic Engineering": ["Analytical Chemistry", "Basic Immunology", "Cell Biology", "Fund. of Microbiology", "Fundamental of Genetics", "General Pathology", "Medical Instrumentation"],
    "Laboratory Medicine": ["Analytical Chemistry", "B. Parasitology", "Basic Immunology", "BS-Para", "Fund. Microbiology", "General Pathology", "Systemic Histology"],
    "Drugs": ["Analytical Chemistry", "Basic Immunology", "Fund. of Microbiology", "Medical Instrumentation", "Pharmaceutics"],
    "Public Health": ["B. Parasitology", "Basic Human Nutrition", "Basic Immunology", "Concept of Health and Disease", "Fun. Microbiology", "G. Pathology", "M. Entomology", "Parasitology"],
    "Radiology": ["Basic Immunology", "Electricity & Electronics", "G. Pathology", "Mathematics", "Patient Care in Radiography", "Radiation Biophysics"],
    "Medical & Critical Care": ["Basics of High Nursing I", "First Aid", "Medical Ethics", "Pharmacology"]
  },
  "Year 3": {
    "Drugs": ["Applied Pharmacognosy", "Organic Chemistry II", "Pharmaceutical Microbiology"],
    "Laboratory Medicine": ["Cl. Parasitology I", "Cl. Haematology I", "Cl. Histopathology I", "Endocrinology", "Training"],
    "Medical & Critical Care": ["Clinical Nutrition", "Gynecology and Obstetrics", "Medicine", "Surgery"],
    "Radiology": ["Dental X Ray", "Instruments of X Ray Machines", "Principals of Diagnostic Radiology", "Radiographic Positioning", "Training"],
    "Genetic Engineering": ["Environmental Biotechnology", "Immunogenetics", "Microbial Genetics", "Molecular Genetics", "Population and Evol. Genetics"],
    "Public Health": ["Environmental Health", "Food Microbiology", "G. Epidemiology", "Health Education", "Maternal and Child Care", "Nutrition and Metabolism", "Primary Health Care"],
    "Dental": ["Fixed Prosthodontics I", "General Pathology", "Oral Microbiology", "Removable Complete Prosthodontics - I", "Removable Partial Prosthodontics - I"]
  },
  "Year 4": {
    "Medical & Critical Care": ["Anesthesia Technique", "Clinical Anesthesia", "ICU"],
    "Genetic Engineering": ["Bioinformatics", "Genetic Engineering", "Molecular Pathology", "Pharmacogenetics"],
    "Laboratory Medicine": ["Blood Bank", "Cl. Biochemistry II", "Cl. Haematology", "Cl. Haematology II", "Cl. Immunology II", "Cl. Microbiology", "Cl. Microbiology I", "Haematology", "Research Project"],
    "Public Health": ["Communicable Diseases", "Environmental Microbiology", "Food and Nutrition Security", "Food Hygiene and Safety", "Nutrition During Life Cycle", "Public Health Training"],
    "Dental": ["Fixed Prosthodontics II", "Maxillofacial Prosthodontics", "Removable Complete Prosthodontics - II", "Removable Partial Prosthodontics - II"],
    "Radiology": ["Nuclear Medicine", "Radiobiology", "Special Investigation"],
    "Drugs": ["Pharmaceutical Engineering", "Pharmacology II", "Physical Pharmacy", "Quality Control"]
  }
};