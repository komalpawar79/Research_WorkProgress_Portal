import {
  UserProfile,
  ResearchProject,
  Chapter,
  ChapterDocument,
  PaymentRecord,
  PaymentSummary,
  Notification,
  TimelineStep,
  DocumentPage,
} from '../types/database.types';

export const mockProfile: UserProfile = {
  id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
  full_name: 'Rahul Sharma',
  email: 'rahul@gmail.com',
  phone: '+91 98765 43210',
  university: 'XYZ University',
  department: 'Computer Science',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  role: 'student',
  created_at: '2026-09-01T08:00:00Z',
  updated_at: '2026-09-15T12:00:00Z',
};

export const mockProject: ResearchProject = {
  id: 'b819231f-0e48-433b-a5d6-84391e4f4a32',
  user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
  topic: 'AI-Based Healthcare System',
  research_type: 'Thesis',
  status: 'In Progress',
  overall_progress: 78,
  started_at: '02 September 2026',
  expected_completion: '28 September 2026',
  description: 'Developing automated multimodal neural diagnostics for early clinical intervention in primary care settings.',
  created_at: '2026-09-02T04:00:00Z',
  updated_at: '2026-09-15T10:30:00Z',
};

export const mockChapters: Chapter[] = [
  {
    id: 'ch-01-intro',
    project_id: 'b819231f-0e48-433b-a5d6-84391e4f4a32',
    chapter_number: 1,
    title: 'Introduction',
    status: 'Completed',
    progress_percent: 100,
    document_released: true,
    updated_date: '05 September 2026',
    created_at: '2026-09-02T04:00:00Z',
    updated_at: '2026-09-05T14:20:00Z',
  },
  {
    id: 'ch-02-lit-review',
    project_id: 'b819231f-0e48-433b-a5d6-84391e4f4a32',
    chapter_number: 2,
    title: 'Literature Review',
    status: 'Completed',
    progress_percent: 100,
    document_released: true,
    updated_date: '10 September 2026',
    created_at: '2026-09-05T14:30:00Z',
    updated_at: '2026-09-15T10:30:00Z',
  },
  {
    id: 'ch-03-methodology',
    project_id: 'b819231f-0e48-433b-a5d6-84391e4f4a32',
    chapter_number: 3,
    title: 'Methodology',
    status: 'In Progress',
    progress_percent: 60,
    document_released: false,
    updated_date: '15 September 2026',
    created_at: '2026-09-10T09:00:00Z',
    updated_at: '2026-09-15T09:00:00Z',
  },
  {
    id: 'ch-04-results',
    project_id: 'b819231f-0e48-433b-a5d6-84391e4f4a32',
    chapter_number: 4,
    title: 'Results',
    status: 'Not Started',
    progress_percent: 0,
    document_released: false,
    updated_date: 'Pending',
    created_at: '2026-09-10T09:00:00Z',
    updated_at: '2026-09-15T09:00:00Z',
  },
];

export const mockTimelineSteps: TimelineStep[] = [
  {
    step_number: 1,
    title: 'Project Started',
    status: 'completed',
    date: '02 Sep 2026',
    description: 'Initial topic approval and supervisor alignment'
  },
  {
    step_number: 2,
    title: 'Chapter 1 Completed',
    status: 'completed',
    date: '05 Sep 2026',
    description: 'Introduction & Problem Formulation approved'
  },
  {
    step_number: 3,
    title: 'Chapter 2 Completed',
    status: 'completed',
    date: '10 Sep 2026',
    description: 'Literature Review & State-of-the-Art synthesis'
  },
  {
    step_number: 4,
    title: 'Chapter 3 In Progress',
    status: 'in_progress',
    date: '15 Sep 2026',
    description: 'System Architecture & Data Pipeline formulation'
  },
  {
    step_number: 5,
    title: 'Chapter 4 Not Started',
    status: 'not_started',
    date: 'Est. 22 Sep 2026',
    description: 'Experimental Validation & Comparative Benchmarks'
  },
  {
    step_number: 6,
    title: 'Final Research Work',
    status: 'not_started',
    date: 'Est. 28 Sep 2026',
    description: 'Final Defense, Formatting & Thesis Submission'
  },
];

export const mockPayments: PaymentRecord[] = [
  {
    id: 'pay-01',
    user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
    amount: 15000,
    payment_method: 'UPI',
    status: 'Paid',
    payment_date: '05 Sept 2026',
    transaction_ref: 'UPI/9842109281/AXIS',
    created_at: '2026-09-05T09:15:00Z',
  },
  {
    id: 'pay-02',
    user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
    amount: 20000,
    payment_method: 'Bank Transfer',
    status: 'Paid',
    payment_date: '12 Sept 2026',
    transaction_ref: 'NEFT/HDFC00281923',
    created_at: '2026-09-12T14:20:00Z',
  },
];

export const mockPaymentSummary: PaymentSummary = {
  total_amount: 50000,
  amount_paid: 35000,
  remaining: 15000,
  status: 'Partial',
};

export const mockNotifications: Notification[] = [
  {
    id: 'notif-01',
    user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
    title: 'Chapter 2 Completed',
    message: 'Your Literature Review chapter has been completed successfully.',
    type: 'chapter_completed',
    read: false,
    related_chapter_id: 'ch-02-lit-review',
    action_url: '/chapters',
    created_at: '15 Sep 2026',
  },
  {
    id: 'notif-02',
    user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
    title: 'Chapter 1 Completed',
    message: 'Your Introduction chapter is now available.',
    type: 'chapter_completed',
    read: false,
    related_chapter_id: 'ch-01-intro',
    action_url: '/chapters',
    created_at: '05 Sep 2026',
  },
  {
    id: 'notif-03',
    user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
    title: 'Payment Received',
    message: 'Your payment of ₹15,000 has been successfully received.',
    type: 'payment_received',
    read: false,
    action_url: '/payments',
    created_at: '12 Sep 2026',
  },
  {
    id: 'notif-04',
    user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
    title: 'New Update Available',
    message: 'Chapter 3 is now in progress (60%).',
    type: 'chapter_progress',
    read: true,
    related_chapter_id: 'ch-03-methodology',
    action_url: '/chapters',
    created_at: '10 Sep 2026',
  },
];

// Sample multi-page academic document data for Chapter 2 Literature Review (12 Pages)
export const mockChapter2Pages: DocumentPage[] = [
  {
    page_number: 1,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.1 Introduction to Clinical Decision Support Systems',
    paragraphs: [
      'The literature review plays a crucial role in understanding the existing research, identifying gaps, and establishing the foundation for the current study. This chapter provides a detailed review of relevant studies, methodologies, and key findings in the domain of AI-based healthcare systems.',
      'Over the past decade, the intersection of deep convolutional neural networks and clinical diagnostic procedures has evolved from speculative laboratory experiments into rigorously benchmarked decision support frameworks. Early pioneering works by Esteva et al. (2017) demonstrated dermatologist-level classification of skin lesions, validating that raw high-dimensional biomedical imaging could be parsed with high clinical sensitivity.',
      'Subsequent investigations by Rajpurkar et al. (2018) on CheXNet established that multi-label chest radiography classifiers could identify pneumonia and pleural effusion with radiologist-competitive receiver operating characteristic (ROC) curves. However, contemporary scholarly discourse increasingly underscores the limitation of isolated convolutional architectures in handling multi-modal patient context.',
    ],
    notes: 'Primary foundational synthesis of computer vision in clinical diagnostics (2017-2023).'
  },
  {
    page_number: 2,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.2 Evolution of Diagnostic Neural Architectures',
    paragraphs: [
      'The shift from classical feature engineering (such as Gabor filters and Scale-Invariant Feature Transforms) toward end-to-end representation learning marked the second paradigm shift in computer-aided diagnostics (CAD). Vaswani et al. (2017) introduced self-attention mechanisms, which were subsequently adapted into Vision Transformers (ViT) by Dosovitskiy et al. (2020).',
      'In medical imaging, Vision Transformers exhibit superior capability in capturing global contextual dependencies across anatomical regions compared to localized receptive fields of standard CNNs. As noted by Chen et al. (2021) in TransUNet, hybrid architectures bridging convolutional tokenizers with transformer encoders yield statistically significant improvements in multi-organ abdominal CT segmentation.',
    ],
    tables: [
      {
        caption: 'Table 2.1: Comparative Analysis of State-of-the-Art Biomedical Feature Extractors',
        headers: ['Architecture', 'Paradigm', 'Context Range', 'Inductive Bias', 'Validation Accuracy'],
        rows: [
          ['ResNet-50 / 101', 'Pure CNN', 'Local / Receptive Field', 'Translation Equivariance', '89.4%'],
          ['DenseNet-121', 'Feature Reuse CNN', 'Local / Concatenated', 'Dense Connectivity', '91.2%'],
          ['Swin Transformer', 'Hierarchical ViT', 'Shifted Window Global', 'Shifted Local Window', '93.8%'],
          ['Hybrid TransUNet', 'CNN + Transformer', 'Multi-Scale Hierarchical', 'Combined Inductive', '94.6%'],
        ]
      }
    ]
  },
  {
    page_number: 3,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.3 Handling Multi-Modal Electronic Health Records (EHR)',
    paragraphs: [
      'While radiological modalities provide structural and volumetric data, effective clinical triage requires simultaneous consideration of longitudinal laboratory vitals, demographic histories, and physician discharge summaries. Rajkomar et al. (2018) demonstrated scalable representations of entire electronic health records using Fast Healthcare Interoperability Resources (FHIR) format.',
      'The primary technical bottleneck lies in the asynchronous sampling rates between continuous ICU telemetry data (ECG, arterial line blood pressure) and sparse discrete laboratory panels (serum creatinine, troponin I). Graph Neural Networks (GNNs) have emerged as the prevailing standard to model non-Euclidean patient-disease ontologies.',
    ]
  },
  {
    page_number: 4,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.4 Explainability & Interpretability in High-Stakes Healthcare',
    paragraphs: [
      'The European Union General Data Protection Regulation (GDPR) and FDA Software as a Medical Device (SaMD) regulatory frameworks enforce a strict "Right to Explanation" for automated diagnostic tools. Black-box prediction models, irrespective of empirical accuracy, face insurmountable clinical adoption hurdles without auditable saliency maps.',
      'Gradient-weighted Class Activation Mapping (Grad-CAM) by Selvaraju et al. (2017) remains the baseline interpretability technique. However, recent systematic reviews by Adebayo et al. (2018) revealed that saliency methods can produce visual heatmaps invariant to model weight perturbations, raising urgent concerns about visual confirmation bias among attending physicians.',
    ]
  },
  {
    page_number: 5,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.5 Bias, Generalizability, and Dataset Shift',
    paragraphs: [
      'A critical vulnerability identified across 74 empirical publications is domain distribution shift. Deep learning classifiers trained exclusively on high-resource tertiary hospital repositories (such as MIMIC-III, CheXpert, and UK Biobank) exhibit a performance degradation of 14% to 22% when deployed in rural or community clinics.',
      'Confounders such as radiographic equipment manufacturer, pediatric versus geriatric chest morphology, and contrast agent artifacts frequently introduce spurious correlation shortcuts. Zech et al. (2018) demonstrated that CNNs often learn hospital-specific scanner tags rather than pathology itself.',
    ]
  },
  {
    page_number: 6,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.6 Federated Learning & Privacy Preservation',
    paragraphs: [
      'Patient confidentiality mandates under HIPAA and equivalent national statutes restrict the centralized pooling of identifiable health information. McMahan et al. (2017) formulated Federated Averaging (FedAvg) as a distributed optimization scheme where local client nodes train weights and aggregate gradients centrally.',
      'In medical consortiums, Differential Privacy (DP) mechanisms are layered atop federated updates to thwart model inversion and membership inference attacks. Li et al. (2020) demonstrated that clipping gradient norms and injecting calibrated Gaussian noise preserves differential privacy guarantees without catastrophic utility degradation.',
    ]
  },
  {
    page_number: 7,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.7 Real-Time Edge Deployment Constraints',
    paragraphs: [
      'Hospital edge devices, including bedside ICU monitors and point-of-care ultrasound (POCUS) probes, are constrained by thermal dissipation and limited tensor processing unit (TPU) memory. Model quantization (INT8 post-training quantization) and structured pruning techniques allow large vision transformers to execute under 45ms latency budgets.',
    ]
  },
  {
    page_number: 8,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.8 Human-in-the-Loop Clinical Workflows',
    paragraphs: [
      'Rather than autonomous replacement, modern literature emphasizes collaborative intelligence where algorithmic uncertainty triggers expert triage. Bayesian Neural Networks and Monte Carlo Dropout allow the system to output calibrated epistemic uncertainty scores alongside probability distributions.',
    ]
  },
  {
    page_number: 9,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.9 Ethical Governance & Algorithmic Stewardship',
    paragraphs: [
      'Ethical oversight committees require continuous post-market surveillance. Drift detection algorithms monitor concept shift and covariate shift in real-time, halting automated triage if demographic parity thresholds are breached.',
    ]
  },
  {
    page_number: 10,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.10 Identification of Research Gaps',
    paragraphs: [
      'From the comprehensive review of 180+ peer-reviewed publications between 2018 and 2026, three foundational gaps emerge:',
      '1. Lack of unified multi-modal fusion architectures that reconcile unstructured clinical notes with dense 3D volumetric DICOM images simultaneously.',
      '2. Inadequate real-world resilience against adversarial out-of-distribution clinical presentations.',
      '3. Absence of standardized, tamper-evident audit trails for diagnostic recommendations.',
    ]
  },
  {
    page_number: 11,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.11 Synthesis & Proposed Conceptual Framework',
    paragraphs: [
      'To address these delineated deficiencies, the present thesis proposes a dual-branch self-supervised transformer framework that couples cross-attention token alignment with calibrated epistemic uncertainty bounds.',
    ]
  },
  {
    page_number: 12,
    title: 'Chapter 2 — Literature Review',
    section_title: '2.12 Chapter Summary & Next Steps',
    paragraphs: [
      'This chapter comprehensively examined the historical and contemporary landscape of AI diagnostics, cataloging critical algorithmic progressions, failure modes, and regulatory standards. Chapter 3 will delineate the mathematical formulation and system architecture of the proposed multi-modal pipeline.',
    ],
    notes: 'End of Chapter 2. Formally approved by supervisor.'
  },
];

export const mockChapter1Pages: DocumentPage[] = [
  {
    page_number: 1,
    title: 'Chapter 1 — Introduction',
    section_title: '1.1 Background & Motivation',
    paragraphs: [
      'The modern healthcare ecosystem confronts an escalating burden of chronic pathologies, demographic aging, and a global deficit of certified medical specialists. According to the World Health Organization, the shortfall of healthcare practitioners is projected to reach 10 million by 2030, predominantly impacting developing nations.',
      'Artificial intelligence systems, specifically self-supervised deep learning architectures, present a transformative paradigm for augmentative diagnostics. By standardizing the initial triage and feature extraction phases, clinical bottlenecks can be alleviated while maintaining high diagnostic fidelity.',
    ]
  },
  {
    page_number: 2,
    title: 'Chapter 1 — Introduction',
    section_title: '1.2 Problem Statement & Research Questions',
    paragraphs: [
      'Despite significant advancements, contemporary computer-aided diagnostic tools remain fractured across isolated medical specialties, lacking inter-operable cross-modality reasoning. This research addresses the fundamental challenge of building robust, verifiable, and privacy-preserving multi-modal clinical intelligence systems.',
    ]
  },
  {
    page_number: 3,
    title: 'Chapter 1 — Introduction',
    section_title: '1.3 Research Objectives & Scope',
    paragraphs: [
      'The core objectives of this thesis encompass:',
      '1. Formulating an end-to-end multi-modal neural architecture for multi-organ pathology detection.',
      '2. Establishing auditable explainability maps adhering to international regulatory benchmarks.',
      '3. Demonstrating sub-50ms inference on clinical edge workstations without compromising predictive accuracy.',
    ]
  },
];

export const mockDocumentMap: Record<string, ChapterDocument> = {
  'ch-01-intro': {
    id: 'doc-01',
    chapter_id: 'ch-01-intro',
    user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
    file_title: 'Chapter 1 — Introduction',
    page_count: 3,
    storage_path: 'protected_docs/ch1_intro.pdf',
    watermark_text: 'CONFIDENTIAL\nRahul Sharma\nFOR REVIEW ONLY',
    is_active: true,
    created_at: '2026-09-05T14:20:00Z',
    pages: mockChapter1Pages,
  },
  'ch-02-lit-review': {
    id: 'doc-02',
    chapter_id: 'ch-02-lit-review',
    user_id: 'd7a85859-9942-4f6b-88a2-71cbe57297e1',
    file_title: 'Chapter 2 — Literature Review',
    page_count: 12,
    storage_path: 'protected_docs/ch2_lit_review.pdf',
    watermark_text: 'CONFIDENTIAL\nRahul Sharma\nFOR REVIEW ONLY',
    is_active: true,
    created_at: '2026-09-15T10:30:00Z',
    pages: mockChapter2Pages,
  },
};

