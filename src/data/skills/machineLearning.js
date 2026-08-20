// Classical ML & deep learning frameworks.
export const machineLearningSkills = [
  {
    id: "ml-fundamentals",
    name: "Classical ML Fundamentals",
    category: "Machine Learning",
    level: 10,
    why: "Baseline for every ML/AI-flavored company: Coupa, Wipro, TIAA, KLA, Accenture — regression, SVM, decision trees, evaluation metrics.",
    subskills: [
      { id: "ml-bias-variance", name: "Bias-Variance Tradeoff", weight: 2, todos: ["Explain overfitting/underfitting with a learning-curve sketch", "Diagnose whether a real model is overfitting or underfitting from its train/val metrics"] },
      { id: "ml-regression", name: "Regression Models", weight: 2, todos: ["Implement linear/logistic regression from scratch (gradient descent, not a library call)", "Explain regularization (L1/L2) and when each is preferred"] },
      { id: "ml-tree-models", name: "Decision Trees & Ensembles", weight: 2, todos: ["Explain how a Random Forest reduces variance versus a single decision tree", "Re-run the label-noise project's 10-vs-200-tree experiment on a new dataset to check it generalizes"] },
      { id: "ml-svm", name: "SVM", weight: 1, todos: ["Explain the margin-maximization intuition behind SVM without heavy math", "Explain the kernel trick with one concrete example (RBF)"] },
      { id: "ml-pipeline", name: "Full Modeling Pipeline", weight: 3, todos: ["Narrate a complete pipeline out loud: data collection -> preprocessing -> model choice -> loss function -> evaluation metric", "Defend a metric choice (precision vs recall vs F1) for a specific real scenario"] },
    ],
  },
  {
    id: "deep-learning",
    name: "Deep Learning",
    category: "Machine Learning",
    level: 10,
    why: "Demonstrated via the Search & Retrieval Engine's sentence-transformer embeddings and the Genomic Streaming Pipeline's 19-feature PyTorch classifier.",
    subskills: [
      { id: "dl-cnns", name: "CNNs", weight: 2, todos: ["Explain convolution, padding, and stride with a worked numeric example", "Explain why filter-size changes affect both accuracy and latency"] },
      { id: "dl-backprop", name: "Backpropagation", weight: 2, todos: ["Derive backpropagation for a 2-layer network by hand", "Explain vanishing/exploding gradients and one mitigation for each"] },
      { id: "dl-training-tricks", name: "Training Stability (batch norm, dropout)", weight: 1, todos: ["Explain what batch normalization actually normalizes and why it helps", "Explain dropout's role in preventing co-adaptation"] },
      { id: "dl-transfer-learning", name: "Transfer Learning & Fine-tuning", weight: 2, todos: ["Fine-tune a pretrained model on a new task end to end", "Explain when to freeze base layers versus fine-tune the whole network"] },
    ],
  },
  {
    id: "pytorch",
    name: "PyTorch",
    category: "Machine Learning",
    level: 10,
    why: "The framework behind the Multi-Model NLP Platform, the Distributed Genomic Streaming Pipeline's classifier, and the M.Tech project's tooling.",
    subskills: [
      { id: "pytorch-tensors-autograd", name: "Tensors & Autograd", weight: 2, todos: ["Write a training loop from scratch using autograd, not a high-level trainer", "Explain requires_grad and detach()'s purpose"] },
      { id: "pytorch-custom-models", name: "Custom nn.Module Design", weight: 2, todos: ["Build a custom nn.Module with a non-trivial forward pass", "Explain the difference between nn.Module and a plain function-based model"] },
      { id: "pytorch-data-loading", name: "Data Loading (Dataset/DataLoader)", weight: 1, todos: ["Write a custom Dataset class for a real data source", "Explain num_workers and pin_memory's role in data-loading performance"] },
    ],
  },
  {
    id: "tensorflow",
    name: "TensorFlow",
    category: "Machine Learning",
    level: 10,
    why: "The other major DL framework — worth basic fluency even with a PyTorch-first background, since some companies standardize on it.",
    subskills: [
      { id: "tf-keras-api", name: "Keras Sequential/Functional API", weight: 2, todos: ["Build the same model in both Sequential and Functional API styles", "Explain when the Functional API is required over Sequential"] },
      { id: "tf-training-loop", name: "Custom Training Loops (GradientTape)", weight: 1, todos: ["Write a custom training loop using GradientTape instead of model.fit", "Explain eager execution vs graph execution in TensorFlow"] },
    ],
  },
  {
    id: "sklearn",
    name: "scikit-learn",
    category: "Machine Learning",
    level: 10,
    why: "Used across the ML-focused resume variant for classical model comparison and evaluation.",
    subskills: [
      { id: "sklearn-pipelines", name: "Pipeline & ColumnTransformer", weight: 2, todos: ["Build a preprocessing+model Pipeline that avoids data leakage from train to test", "Explain why fitting a scaler on the full dataset before splitting is a bug"] },
      { id: "sklearn-model-selection", name: "Cross-Validation & Grid Search", weight: 2, todos: ["Run k-fold cross-validation and interpret variance across folds", "Explain the difference between GridSearchCV and RandomizedSearchCV"] },
    ],
  },
  {
    id: "model-evaluation",
    name: "Model Evaluation & Metrics",
    category: "Machine Learning",
    level: 10,
    why: "Demonstrated at genuine depth in the Multi-Model NLP Platform (LIME, bootstrap testing) and the Label Noise project (750-run controlled experiments).",
    subskills: [
      { id: "eval-classification-metrics", name: "Classification Metrics", weight: 2, todos: ["Compute precision/recall/F1/AUC by hand from a confusion matrix", "Choose the right metric for an imbalanced-class scenario and justify it"] },
      { id: "eval-statistical-rigor", name: "Statistical Rigor (bootstrap, multi-seed)", weight: 3, todos: ["Run a multi-seed evaluation and report variance, not just a single-run number", "Compute a bootstrap confidence interval for a real metric"] },
      { id: "eval-explainability", name: "Explainability (LIME/SHAP)", weight: 2, todos: ["Run LIME on a real model's prediction and interpret the output", "Try SHAP on the same model and compare what it surfaces versus LIME"] },
    ],
  },
];
