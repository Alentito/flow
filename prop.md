# Research Proposal: Uncertainty-Aware Neural Circuit Models for Brain-Inspired Machine Learning

**PhD Studentship Application — NeuroAI: Cognitive Computation in Biological and Artificial Intelligence**

---

## 1. Introduction and Motivation

Decision-making under uncertainty is a hallmark of intelligent behaviour. Biological brains routinely make rapid, adaptive decisions despite noisy and incomplete information, seamlessly monitoring their own confidence, detecting errors, and adjusting strategies on the fly. In contrast, contemporary artificial intelligence (AI) systems, despite remarkable advances in deep learning and reinforcement learning (RL), remain brittle when confronted with ambiguity, lack intrinsic mechanisms for uncertainty quantification, and typically require dense external reward signals to learn (Hassabis et al., 2017; Zador et al., 2023).

This proposal aims to bridge this gap by developing **brain-inspired machine learning algorithms endowed with neural uncertainty-monitoring mechanisms**. The core thesis is that by integrating computational principles from neural circuit models of decision uncertainty (Atiya et al., 2019a,b, 2020) with modern deep reinforcement learning architectures — and further enriching them with insights from neural oscillation dynamics and nested multi-time-scale learning (Behrouz et al., 2025) — we can create a new class of **self-aware, uncertainty-driven AI agents** that are more robust, interpretable, and biologically plausible.

This research sits at the intersection of computational neuroscience and machine learning, directly aligned with the group's mission to build novel AI algorithms inspired by brain function and to use AI to elucidate brain computation (Sadeh & Clopath, 2025; Hassabis et al., 2017; Takahashi & Hikida, 2021).

---

## 2. Background and Literature Review

### 2.1 Neural Circuit Models of Decision Uncertainty

Atiya et al. (2019) proposed a biologically grounded neural circuit model published in *Nature Communications* that explicitly computes **decision uncertainty** — the reciprocal of decision confidence. The model features three key modules:

1. **Sensorimotor module**: Two competing excitatory neuronal populations accumulate noisy sensory evidence, governed by recurrent excitation and lateral inhibition, consistent with attractor dynamics (Wong & Wang, 2006).
2. **Uncertainty-monitoring module**: An inhibitory population integrates the summed activities of the competing populations, which in turn inhibits an excitatory "uncertainty-encoding" population. This provides a continuous, real-time readout of decision uncertainty.
3. **Motor module**: Downstream populations that execute the decision.

Crucially, the model includes a **feedback loop** from the uncertainty-monitoring module back to the sensorimotor populations. This top-down signal is the computational basis for:
- **Change-of-mind behaviour**: High uncertainty triggers re-evaluation of the initial choice through a transient choice-neutral steady state and noisy fluctuations.
- **Sequential trial effects**: A proxy memory mechanism carries uncertainty information across trials, modulating subsequent response times.
- **The "<" pattern**: The counter-intuitive relationship where, for error trials, higher evidence quality is associated with higher uncertainty.

The model accounts for behavioural data (accuracy, response time distributions, confidence reports) and neural data (phasic orbitofrontal cortex responses, motor trajectory curvatures) in a unified framework.

### 2.2 Neural Oscillations as Decision Modulators

A more recent paper from the group extends this line of work to investigate how **neural oscillations** — coherent fluctuations in neural activity across frequency bands — selectively modulate decision dynamics. Key findings include:

- Decision networks with faster excitatory than inhibitory synapses are more susceptible to oscillatory modulation.
- **In-phase oscillations** at higher amplitudes can reduce decision confidence without affecting accuracy, while increasing speed — **decoupling** the traditional speed-accuracy-confidence trade-off.
- **Anti-phase modulations** simultaneously increase accuracy, confidence, and speed.
- Increasing oscillation frequency reverses these effects, and the oscillatory phase difference has a **nonlinear** impact on decision confidence.

These results reveal that oscillations are not mere epiphenomena but serve as a **selective control mechanism** over decision computation — a principle with deep implications for both neuroscience (understanding how different oscillatory regimes implement cognitive flexibility) and AI (designing dynamic modulation schemes for neural network inference).

### 2.3 Nested Learning and Multi-Time-Scale Optimisation

The Nested Learning (NL) framework (Behrouz et al., 2025, NeurIPS 2025) draws inspiration from neuroplasticity and memory consolidation to reconceptualise deep learning. Rather than treating architecture and optimisation as independent design choices, NL sees them as **different levels of a unified, nested optimisation problem** with multiple time scales of update:

- **Continuum Memory Systems (CMS)**: Generalises short-term/long-term memory into a distributed system with a spectrum of update frequencies, mirroring synaptic consolidation in the brain.
- **Deep Optimizers**: Views gradient-based optimisers (SGD, Adam) as associative memory modules that compress gradients, enabling the design of more expressive optimisers with deeper memory.
- **Self-modifying models**: Architectures that can modify their own update algorithms, fostering true continual learning.
- **HOPE architecture**: A proof-of-concept showing strong performance in language modelling, continual learning, and long-context reasoning.

The connection to the neural circuit model is profound: just as the brain uses multi-time-scale dynamics (fast synaptic transmission, slow neuromodulation, consolidation during sleep) to adaptively process uncertainty, NL proposes learning systems with analogous hierarchical temporal structure.

### 2.4 The NeuroAI Landscape

Several landmark papers establish the broader intellectual framework for this research:

- **Hassabis et al. (2017), *Neuron***: Argues that neuroscience provides both inspiration for new AI algorithms and validation for existing ones, at the computational and algorithmic levels of Marr's hierarchy.
- **Zador et al. (2023), *Nature Communications***: Proposes the "embodied Turing test" and a roadmap for next-generation AI through sensorimotor competence inspired by 500 million years of animal evolution.
- **Sadeh & Clopath (2025), *Nature Reviews Neuroscience***: Outlines the bidirectional promise of NeuroAI — using neuroscience to inspire AI and AI to advance neuroscience — while highlighting the need for interpretability.
- **O'Connell et al. (2018), *Trends in Neurosciences***: Reviews how neural decision signals can empirically adjudicate between competing computational models, bridging neural and computational decision-making.

---

## 3. Research Aims and Objectives

The overarching aim is to develop **uncertainty-aware, brain-inspired machine learning algorithms** that leverage principles from neural circuit models of decision uncertainty. The research is structured around four interconnected objectives:

### Objective 1: Uncertainty-Aware Deep Reinforcement Learning Agent
**Integrate the neural circuit model of uncertainty into deep RL architectures**

Drawing directly from the future directions of the neural circuit model (Atiya et al., 2019, §7.4), the first objective is to combine the uncertainty-monitoring module with deep neural networks for reinforcement learning. Specifically:

- **Neurally-grounded uncertainty estimation**: Replace or augment standard uncertainty quantification methods in deep RL (e.g., MC-Dropout (Gal & Ghahramani, 2016), ensemble methods) with the biologically plausible uncertainty-monitoring circuit. The inhibitory-excitatory dynamics that compute uncertainty in the neural model will be translated into differentiable neural network components.
- **Improved exploration–exploitation trade-off**: Use the real-time uncertainty signal to modulate action selection — high uncertainty triggers exploratory behaviour, while low uncertainty favours exploitation. This is directly inspired by the biological observation that decision uncertainty drives change-of-mind behaviour.
- **Integration with DQN and policy gradient architectures**: The uncertainty module will be embedded within Deep Q-Networks (Mnih et al., 2015) and policy gradient methods (Lillicrap et al., 2015) to create "uncertainty-endowed" agents.

### Objective 2: Confidence as a Proxy for Reward
**Self-supervised learning through intrinsic confidence signals**

Following the thesis direction (§7.2.3), this objective investigates whether decision confidence can serve as an intrinsic reward signal in the absence of external feedback:

- **Confidence-driven reward shaping**: Develop an agent that uses its own uncertainty-monitoring module to compute a confidence-derived reward signal, enabling learning in sparse-reward or reward-free environments.
- **Connection to human metacognition**: Model the experimental findings of Rouault et al. (2019) and Zylberberg et al. (2018) showing that humans use confidence as a proxy for performance and belief updating.
- **Hierarchical Bayesian integration**: Combine the neural circuit model with hierarchical Bayesian inference to create agents that update their "beliefs" about environmental statistics using confidence, mirroring human metacognitive strategies.

### Objective 3: Oscillatory Modulation for Adaptive Inference
**Leverage neural oscillation principles for dynamic neural network modulation**

Inspired by the neural oscillation paper, this objective translates oscillatory modulation principles into machine learning:

- **Frequency-dependent gating mechanisms**: Design attention or gating mechanisms in neural networks that are modulated by learnable oscillatory signals, controlling the balance between speed, accuracy, and confidence in inference.
- **Selective decoupling of objectives**: Use oscillatory-inspired modulation to selectively decouple trade-offs (e.g., speed vs. accuracy in inference, exploration vs. exploitation in RL), enabling more flexible and adaptive computation.
- **Phase-dependent information routing**: Implement oscillatory phase relationships to control information flow between network modules, analogous to how neural oscillations coordinate communication between brain regions (Fries, 2015).

### Objective 4: Nested Multi-Time-Scale Learning with Uncertainty
**Combine nested learning principles with uncertainty-monitoring for continual, self-aware learning**

This objective connects the Nested Learning framework with the neural circuit model:

- **Uncertainty-modulated continuum memory**: Extend the CMS from Nested Learning by incorporating uncertainty signals to control the rate of memory consolidation — high-uncertainty experiences are consolidated more slowly or replayed more frequently, mirroring how surprise and uncertainty modulate memory in the brain.
- **Multi-time-scale uncertainty processing**: Design agents with hierarchical uncertainty monitoring at multiple temporal scales — fast uncertainty for immediate decision-making, slow uncertainty for strategic planning and meta-learning — directly inspired by the multi-level optimisation structure of NL.
- **Self-modifying uncertainty thresholds**: Create agents whose decision thresholds (decision bounds, confidence criteria) are themselves learned through the nested optimisation framework, enabling true self-awareness and metacognitive adaptation.

---

## 4. Proposed Methodology

### 4.1 Phase 1: Formalisation and Model Translation (Months 1–10)

1. **Mathematical formalisation**: Translate the mean-field reduced neural circuit equations (Wong & Wang, 2006; Atiya et al., 2019) into differentiable neural network components compatible with automatic differentiation frameworks (PyTorch / JAX).
2. **Bayesian parameter optimisation**: Implement Bayesian fitting procedures (MCMC, as in Berlemont et al., 2019) to optimise the neural circuit model parameters against behavioural datasets from perceptual decision-making tasks.
3. **Baseline deep RL agents**: Implement standard DQN and policy gradient agents with existing uncertainty estimation methods (MC-Dropout, ensemble) as baselines.

### 4.2 Phase 2: Integration and Development (Months 10–24)

4. **Uncertainty-endowed RL agents**: Embed the differentiable uncertainty-monitoring module into deep RL architectures. Train on standard RL benchmarks (OpenAI Gym, Atari, MuJoCo) and compare against baseline uncertainty methods.
5. **Confidence-as-reward experiments**: Develop sparse-reward and reward-free RL environments. Train agents using confidence-derived intrinsic rewards and evaluate against curiosity-driven baselines (Pathak et al., 2017).
6. **Oscillatory modulation mechanisms**: Implement frequency-dependent and phase-dependent modulation layers. Evaluate on tasks requiring adaptive speed-accuracy trade-offs.

### 4.3 Phase 3: Nested Learning Integration (Months 20–30)

7. **Multi-time-scale uncertainty architecture**: Integrate the uncertainty module with the Continuum Memory System from Nested Learning. Design the multi-frequency uncertainty processing hierarchy.
8. **Continual learning evaluation**: Test the combined architecture on continual learning benchmarks, evaluating resistance to catastrophic forgetting and adaptive uncertainty calibration.
9. **Self-modifying threshold learning**: Implement the nested optimisation framework for learning decision thresholds and confidence criteria.

### 4.4 Phase 4: Validation and Neuroscience Feedback (Months 28–36)

10. **Neural data prediction**: Use the developed architecture to generate predictions about neural data (firing rates, oscillatory patterns, confidence reports) and validate against experimental datasets.
11. **Interpretability analysis**: Analyse the learned representations to determine whether the artificial uncertainty-monitoring mechanisms converge on solutions similar to the biological circuit, contributing to understanding brain computation.
12. **Publication and dissemination**: Write up findings for both machine learning (NeurIPS, ICML, ICLR) and neuroscience (Nature Neuroscience, eLife, PLOS Computational Biology) venues.

---

## 5. Expected Contributions

### 5.1 To Machine Learning
- **Biologically grounded uncertainty quantification** that goes beyond ad hoc approximations (dropout, ensembles) by implementing the computational principles of neural uncertainty monitoring.
- **Self-aware RL agents** that use confidence as an intrinsic reward signal, enabling learning in real-world scenarios where external rewards are sparse or absent.
- **Improved exploration–exploitation** through principled, brain-inspired uncertainty-driven action selection.
- **Oscillatory modulation mechanisms** that enable selective, dynamic control of network behaviour during inference.
- **Improved continual learning** through uncertainty-modulated memory consolidation within the nested learning framework.

### 5.2 To Neuroscience
- **Computational validation** of the neural circuit model's predictions through large-scale simulation and optimisation.
- **New predictions** about the role of uncertainty monitoring in adaptive behaviour that can be tested experimentally.
- **Better understanding** of how neural oscillations interact with decision uncertainty at the circuit level.
- **AI as a tool for neuroscience**: Using deep RL agents as *in silico* models of decision-making to generate hypotheses about neural mechanisms (Sadeh & Clopath, 2025).

### 5.3 To the NeuroAI Agenda
- A concrete demonstration of the bidirectional NeuroAI vision: neuroscience principles improving AI, and AI models illuminating neuroscience (Hassabis et al., 2017; Zador et al., 2023).
- Progress toward the "embodied Turing test" by developing agents with human-like metacognitive capabilities.
- Greater interpretability and explainability of deep RL through biologically grounded architectures.

---

## 6. Timeline

| Phase | Period | Key Activities |
|-------|--------|----------------|
| **Phase 1** | Months 1–10 | Literature review, mathematical formalisation, Bayesian fitting, baseline implementation |
| **Phase 2** | Months 10–24 | Uncertainty-endowed RL agents, confidence-as-reward, oscillatory modulation |
| **Phase 3** | Months 20–30 | Nested learning integration, continual learning experiments, self-modifying thresholds |
| **Phase 4** | Months 28–36 | Neural data validation, interpretability analysis, publications, thesis writing |

---

## 7. Why This Research Group

This proposal is a natural extension of the group's existing work. The supervisor's neural circuit model of decision uncertainty (Atiya et al., 2019) provides the foundational biological model, while the neural oscillation work provides the dynamical modulation framework. The group's expertise in both computational neuroscience (biophysical neural modelling, decision-making) and machine learning (deep learning, RL) creates the ideal environment for this bidirectional NeuroAI research.

The seven reference papers for this studentship delineate a coherent intellectual trajectory:
1. **Neural foundations**: The neural circuit model and neural oscillation papers provide the biological computational principles.
2. **Decision-making theory**: The bridging paper (O'Connell et al., 2018) connects neural signals to computational models.
3. **NeuroAI roadmap**: The landscape papers (Hassabis et al., 2017; Zador et al., 2023; Sadeh & Clopath, 2025; Takahashi & Hikida, 2021) establish the intellectual agenda.
4. **Modern ML connection**: The Nested Learning paper (Behrouz et al., 2025) provides cutting-edge ML methodology grounded in neuroscientific principles.

This proposal directly addresses the future research directions outlined in the neural circuit model thesis — integrating optimisation techniques (§7.2.1), using confidence as reward proxy (§7.2.3), and connecting to deep reinforcement learning (§7.4) — while extending them with the latest advances in neuroscience-inspired machine learning.

---

## 8. References

- Atiya, N. A. A., et al. (2019). A neural circuit model of decision uncertainty and change-of-mind. *Nature Communications*, 10, 2287.
- Atiya, N. A. A., et al. (2020). Changes-of-mind in the absence of new post-decision evidence. *PLOS Computational Biology*.
- Behrouz, A., et al. (2025). Nested Learning: The Illusion of Deep Learning Architectures. *NeurIPS 2025*.
- Berlemont, K., et al. (2019). Monte Carlo Markov Chain fitting of attractor network models to behavioural data.
- Bogacz, R., & Cohen, J. D. (2004). Parameterization of connectionist models.
- Bogacz, R., et al. (2006). The physics of optimal decision making: a formal analysis of models of performance in two-alternative forced-choice tasks. *Psychological Review*, 113(4), 700.
- Fries, P. (2015). Rhythms for cognition: communication through coherence. *Neuron*, 88(1), 220–235.
- Gal, Y., & Ghahramani, Z. (2016). Dropout as a Bayesian approximation: Representing model uncertainty in deep learning. *ICML*.
- Hassabis, D., et al. (2017). Neuroscience-Inspired Artificial Intelligence. *Neuron*, 95(2), 245–258.
- Lillicrap, T. P., et al. (2015). Continuous control with deep reinforcement learning. *arXiv preprint arXiv:1509.02971*.
- Mnih, V., et al. (2015). Human-level control through deep reinforcement learning. *Nature*, 518(7540), 529–533.
- O'Connell, R. G., et al. (2018). Bridging Neural and Computational Viewpoints on Perceptual Decision-Making. *Trends in Neurosciences*, 41(11), 838–852.
- Pathak, D., et al. (2017). Curiosity-driven exploration by self-predictive learning. *ICML*.
- Rouault, M., et al. (2019). Human metacognition across domains.
- Sadeh, S., & Clopath, C. (2025). The emergence of NeuroAI: bridging neuroscience and artificial intelligence. *Nature Reviews Neuroscience*, 26, 583–584.
- Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction*. MIT Press.
- Takahashi, H., & Hikida, T. (2021). Natural and artificial intelligence: A brief introduction to the interplay between AI and neuroscience research. *Neural Networks*.
- Wong, K. F., & Wang, X. J. (2006). A recurrent network mechanism of time integration in perceptual decisions. *Journal of Neuroscience*, 26(4), 1314–1328.
- Zador, A., et al. (2023). Catalyzing next-generation Artificial Intelligence through NeuroAI. *Nature Communications*, 14, 1597.
- Zylberberg, A., et al. (2018). The construction of confidence in a perceptual decision. *Frontiers in Integrative Neuroscience*.
