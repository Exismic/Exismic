export interface YoutubeBlueprint {
  id: string;
  title: string;
  videoId: string;
  url: string;
  category: string;
  duration: string;
  channel: string;
  summary: string;
  blog: string;
  thread: string;
  segments: Array<{ timeLabel: string; text: string }>;
}

export const YOUTUBE_BLUEPRINTS: YoutubeBlueprint[] = [
  {
    id: "neural-networks",
    title: "Neural Networks & Deep Learning Architecture",
    videoId: "aircAruvnKk",
    url: "https://www.youtube.com/watch?v=aircAruvnKk",
    category: "AI & Tech",
    duration: "19:13",
    channel: "3Blue1Brown",
    summary: `### Summary Overview
This video breaks down the mathematical foundations of artificial neural networks using visual intuition. It demonstrates how layered matrix operations, activation functions (like Sigmoid and ReLU), and weighted connections enable a network to recognize handwritten digits with high accuracy.

### Key Takeaways
- **Layer Hierarchies**: Neurons in the earliest hidden layers detect low-level sub-components (edges, strokes, loops), while subsequent layers synthesize these into complete semantic digits.
- **Weighted Combinations**: Each neuron calculates a weighted sum of activations from the previous layer, adds a bias term to shift the activation threshold, and passes the result through an activation function.
- **Matrix Representation**: Stacking all weights into a matrix allows GPUs to process thousands of inputs simultaneously using hardware-accelerated linear algebra.
- **Cost Function & Gradient Descent**: The network learns by minimizing an error cost function, nudging thousands of weights in the direction of steepest descent.

### Action Items & Practical Applications
1. When training neural networks, always normalize input pixel ranges (0.0 to 1.0) to avoid gradient explosion.
2. Initialize weights using Xavier/He initialization rather than arbitrary random constants.
3. Monitor the training vs. validation loss curve to detect overfitting early.`,
    blog: `# Understanding Neural Networks: A Visual Deep Dive

Artificial neural networks are often described as mysterious black boxes. In reality, they are elegant mathematical machines composed of linear transformations and non-linear activations.

## 1. What Exactly is a Neuron?
In machine learning, a neuron is simply a container that holds a numeric activation value between 0 and 1. When analyzing a 28x28 pixel image, the input layer consists of 784 individual neurons, each representing a single pixel's grayscale intensity.

## 2. The Power of Hidden Layers
Why have hidden layers at all? Rather than jumping directly from pixels to a final classification, hidden layers perform feature decomposition:
- **Layer 1**: Detects localized edges and stroke angles.
- **Layer 2**: Combines edges into recognizable shapes (loops, horizontal bars).
- **Output Layer**: Weighs evidence to select the most probable digit (0–9).

## 3. Mathematical Elegance
Every activation is governed by the fundamental equation:
\`\`\`
a[l] = σ(W[l] · a[l-1] + b[l])
\`\`\`
Where \`W\` is the weight matrix, \`b\` is the bias vector, and \`σ\` is the non-linear activation function.

## Conclusion
Modern AI architectures, from computer vision to large language models, build upon these core principles. Mastering the visual intuition of vector projections and loss gradients is the foundation of high-performance machine learning engineering.`,
    thread: `1/7 🧵 Most people think Neural Networks are complex black boxes.

Here is the entire mathematical intuition broken down in 2 minutes: 👇

---

2/7 🧠 What is a neuron?
It’s simply a number between 0 and 1. 

In a digit recognition model (28x28 pixels), the input layer is 784 neurons. Each represents the brightness of a single pixel.

---

3/7 🔍 How hidden layers "think":
Instead of guessing the digit all at once:
• Layer 1 detects edges & line segments
• Layer 2 detects loops & curves
• Layer 3 pieces together full digits

Hierarchical abstraction is the secret to machine intelligence.

---

4/7 ⚖️ Weights and Biases:
Every connection has a weight (how much that pixel matters) and a bias (how easy it is for the neuron to fire).

Formula: Activation = σ(Weights × Inputs + Bias)

---

5/7 📉 How the network learns:
We define a Cost Function (the margin of error).
Learning is simply using Calculus (Gradient Descent) to roll down the slope until the error hits near zero.

---

6/7 🚀 Why GPUs matter:
Because all of these weights are organized into matrices, graphics cards compute millions of connections in parallel in microseconds.

---

7/7 💡 TL;DR:
Neural networks aren't magic—they are layered linear algebra wrapped in non-linear activation functions. Master the basics and modern AI becomes crystal clear.`,
    segments: [
      { timeLabel: "00:00", text: "Introduction to artificial neural networks and handwritten digit recognition." },
      { timeLabel: "02:15", text: "Breaking down the 784-dimensional input layer from 28x28 pixel images." },
      { timeLabel: "05:40", text: "Why hidden layers matter: decomposing images into edges, loops, and component parts." },
      { timeLabel: "09:20", text: "Calculating weighted sums, bias thresholds, and sigmoid activation curves." },
      { timeLabel: "13:45", text: "Vectorizing calculations with matrix multiplication for high-throughput GPU training." },
      { timeLabel: "17:10", text: "Connecting the output layer to probabilities and summarizing network architecture." },
    ]
  },
  {
    id: "figma-monopoly",
    title: "How Figma Built a $20B Design Monopoly",
    videoId: "kQtK74gB3p4",
    url: "https://www.youtube.com/watch?v=kQtK74gB3p4",
    category: "Startup Strategy",
    duration: "16:45",
    channel: "Startup Breakdown",
    summary: `### Summary Overview
This case study examines how Figma disrupted established software giants like Adobe by betting on in-browser WebGL rendering, real-time multiplayer collaboration, and a community-driven plugin ecosystem.

### Key Takeaways
- **The Browser-First Bet**: When Adobe software required heavy native installs, Dylan Field and Evan Wallace built a C++ WebAssembly engine running at 60 FPS inside Google Chrome.
- **Multiplayer as a Moat**: Figma transformed design from a solitary, file-swapping silo into a shared Google Docs-style canvas where product managers, copywriters, and developers could collaborate in real time.
- **Bottom-Up Product-Led Growth (PLG)**: Designers brought Figma into companies for free. Once entire teams relied on the shared URLs, enterprise upgrades became inevitable.
- **Ecosystem Network Effects**: Figma Community allowed creators to publish design systems and UI kits, creating sticky retention that competitors could not easily copy.

### Action Items for Founders
1. Look for legacy industries where desktop files still dominate (CAD, video, 3D) and evaluate whether browser WebAssembly enables a collaborative alternative.
2. Build sharing mechanisms into the core product workflow so every active user organically invites 3–5 team members.
3. Foster third-party developer plugins early to outsource workflow customization.`,
    blog: `# How Figma Defeated Adobe: The Anatomy of a $20B SaaS Revolution

In 2012, proposing a vector graphics editor inside a web browser sounded impossible. Desktop tools like Adobe Photoshop and Illustrator reigned supreme. Yet ten years later, Adobe agreed to acquire Figma for $20 Billion.

Here is the strategic masterclass behind Figma's rise.

## 1. The Technological Wedge: WebAssembly & WebGL
Most web applications were too sluggish for professional vector editing. Figma solved this by writing their core graphics engine in C++ and compiling it directly to WebAssembly and WebGL. This allowed them to render complex 100,000-node vector canvases at 60 frames per second inside a browser tab.

## 2. Eliminating the "final_v2_FINAL.sketch" Problem
Before Figma, design collaboration was broken:
- Designers emailed heavy files back and forth.
- Developers squinted at static screenshots to guess margins and padding.
- Stakeholders had to install specialized software just to leave feedback.

Figma replaced this with a single URL. A product manager could open a link, leave a comment directly on a button, and watch the designer iterate in real time.

## 3. Product-Led Growth and the Enterprise Flywheel
Figma didn't start with enterprise sales reps cold-calling Fortune 500 executives. Instead:
1. Individual designers started using the free tier.
2. Teams invited copywriters and engineers to review prototypes.
3. When security, single sign-on (SSO), and shared component libraries were needed, the enterprise credit card came out.

## Key Takeaway for Builders
The most powerful competitive advantages often come from changing the distribution medium. By moving design from local hard drives to browser URLs, Figma didn't just build a better tool—they built a collaboration network.`,
    thread: `1/8 🧵 In 2012, everyone laughed at Figma for trying to build design software inside a web browser.

In 2022, Adobe offered $20,000,000,000 to buy them.

Here is the exact playbook Dylan Field used to win: 👇

---

2/8 ⚡ The Technical Moat
Desktop tools like Sketch and Photoshop were fast, while web tools were slow.
Figma wrote their rendering engine in C++ and compiled it to WebAssembly and WebGL.
Result: 60 FPS vector rendering directly in Google Chrome.

---

3/8 🌐 The Power of the URL
Before Figma: "Download this 800MB file, install Sketch, and tell me what you think."
With Figma: "Click this link."
Reducing friction from 20 minutes to 2 seconds changed everything.

---

4/8 👥 Multiplayer as a Growth Loop
Design used to be a solo job.
Figma turned design into a multiplayer team sport like Google Docs.
Every designer who used Figma invited 3 PMs, 5 engineers, and 1 client. Zero marketing spend required.

---

5/8 🎨 The Community Ecosystem
Figma opened the Community tab, letting creators share design systems, iOS UI kits, and plugins for free.
Switching away from Figma meant losing thousands of hours of community-built assets.

---

6/8 🏢 Enterprise Inevitability
Designers adopted it for free.
Soon, entire companies were designing their core products on Figma.
When security and centralized team permissions were needed, enterprise licenses were approved with zero pushback.

---

7/8 📈 The Lesson:
Don't just build a faster version of an existing product.
Change the medium of collaboration and reduce sharing friction to zero.

---

8/8 🔁 If you found this breakdown valuable, follow for more weekly deep dives into high-growth software playbooks!`,
    segments: [
      { timeLabel: "00:00", text: "The state of the design industry in 2012 and Adobe's absolute dominance." },
      { timeLabel: "03:15", text: "Why Dylan Field and Evan Wallace bet on WebAssembly and WebGL inside Chrome." },
      { timeLabel: "06:40", text: "Solving the multiplayer problem: Operational transforms and real-time cursor sync." },
      { timeLabel: "10:10", text: "The viral bottom-up distribution loop that bypassed enterprise procurement." },
      { timeLabel: "13:30", text: "The Community tab and how network effects made Figma unassailable." },
      { timeLabel: "15:45", text: "Strategic takeaways for founders building in established markets." },
    ]
  },
  {
    id: "autonomous-agents",
    title: "The Future of Autonomous AI & Superintelligence",
    videoId: "bJzb-EyGUe0",
    url: "https://www.youtube.com/watch?v=bJzb-EyGUe0",
    category: "AI & Future",
    duration: "1:52:10",
    channel: "Lex Fridman Podcast",
    summary: `### Summary Overview
This discussion explores the next frontier of artificial intelligence: transitioning from passive prompt-and-response chatbots to goal-driven autonomous agents capable of multi-step reasoning, tool execution, and long-horizon planning.

### Key Takeaways
- **From Chatbots to Action Agents**: The primary paradigm shift in AI is moving from text completion to agentic workflows where models use web browsers, code compilers, and APIs autonomously.
- **Compute Scaling & Reasoning**: Pre-training compute is continuing to scale, but test-time compute (inference reasoning chains like thinking models) unlocks breakthroughs in complex mathematics and software engineering.
- **Safety and Alignment Horizons**: As models gain autonomous execution capabilities, verifiable sandboxing and human-in-the-loop permission boundaries become critical security requirements.
- **Economic Deflation in Knowledge Work**: Software development, legal analysis, and creative drafting will experience radical acceleration, allowing small 3-person teams to operate with the output of 50-person enterprises.

### Action Items
1. Design software architectures with tool-calling protocols (JSON schemas, function calling, MCP) rather than raw text outputs.
2. Implement strict execution boundaries and approval gates for destructive operations like database writes or financial transactions.`,
    blog: `# Beyond Chatbots: The Dawn of Autonomous AI Agents

For the past three years, the world has interacted with artificial intelligence through a conversational text box. You type a prompt; the model generates a response.

However, the frontier of AI research is aggressively shifting toward autonomous agents—systems that can reason, formulate hypotheses, browse the web, write code, and iterate until a high-level goal is achieved.

## 1. What Makes an Agent "Autonomous"?
An agent differs from a standard language model in three critical dimensions:
1. **Tool Use**: The ability to inspect files, execute Python scripts, query APIs, and control browser viewports.
2. **Memory & Reflection**: Maintaining state across hours of operation and critiquing its own intermediate results.
3. **Multi-Step Planning**: Decomposing ambiguous objectives into manageable tasks and adjusting course when errors arise.

## 2. Test-Time Compute: The New Scaling Law
Historically, AI progress was driven by scaling pre-training datasets and GPU clusters. While pre-training remains vital, a second scaling dimension has emerged: **test-time compute**. By allowing models to "think" and evaluate multiple reasoning branches before outputting a conclusion, model performance in math, science, and coding jumps exponentially.

## 3. The 3-Person Unicorn Era
As agentic capabilities mature, the leverage available to individual engineers reaches historic highs. Tasks that previously required an entire engineering pod—scaffolding databases, writing integration tests, generating UI components, and drafting marketing documentation—can be orchestrated by a single developer managing specialized agents.

## Conclusion
The future does not belong to those who memorize prompt tricks. It belongs to those who understand how to orchestrate autonomous agents into reliable, resilient workflows.`,
    thread: `1/7 🧵 The chatbot era of AI is coming to an end.

Here is why Autonomous Agents and Test-Time Compute are about to reshape the software industry: 👇

---

2/7 🤖 What is an Agent?
Chatbots wait for your prompt and stop.
Agents receive an objective ("Build this web app"), formulate a plan, run terminal commands, debug errors, and verify the output autonomously.

---

3/7 🧠 The New Scaling Law: Test-Time Compute
AI progress isn't just about bigger pre-training runs anymore.
Giving models time to "think", self-critique, and search through multiple reasoning paths produces massive breakthroughs in complex problem-solving.

---

4/7 🔌 Tools Over Prompts
The best AI systems in 2026 don't just generate text. They operate tools:
• Terminal execution
• Headless browser navigation
• Database migrations
• Vector search retrieval

---

5/7 🛡️ The Alignment Challenge
When AI can execute actions, security is paramount.
We must build robust permission boundaries: sandbox environments, dry-run previews, and human authorization for critical actions.

---

6/7 🚀 Rise of the 1-Person Unicorn
With autonomous agents handling boilerplate coding, QA testing, and customer support, small hyper-focused teams will build software empires previously requiring hundreds of employees.

---

7/7 💡 The takeaway:
Stop thinking of AI as a search engine. Start thinking of AI as a tireless team of junior engineers waiting for actionable direction.`,
    segments: [
      { timeLabel: "00:00", text: "Opening thoughts on the trajectory of artificial general intelligence." },
      { timeLabel: "14:20", text: "Why autonomous agents represent a fundamental departure from passive chatbots." },
      { timeLabel: "32:45", text: "The mathematics of test-time compute and chain-of-thought verification." },
      { timeLabel: "55:10", text: "Safety boundaries: Sandboxing code execution and preventing agent drift." },
      { timeLabel: "1:22:30", text: "Economic impacts: How small engineering teams will outpace legacy enterprises." },
      { timeLabel: "1:48:00", text: "Philosophical closing on human agency and human-AI collaboration." },
    ]
  },
  {
    id: "quantum-computing",
    title: "Quantum Computing & Cryptography Simply Explained",
    videoId: "JhHMJCUmq28",
    url: "https://www.youtube.com/watch?v=JhHMJCUmq28",
    category: "Science & Physics",
    duration: "23:40",
    channel: "Veritasium",
    summary: `### Summary Overview
This video demystifies quantum computing, contrasting classical binary bits with quantum qubits, superposition, and entanglement. It explores how Shor's algorithm threatens modern RSA encryption and how lattice-based cryptography provides post-quantum security.

### Key Takeaways
- **Superposition vs. Classical Bits**: Classical bits are strictly 0 or 1. A qubit exists in a linear combination of states until measured, allowing quantum computers to explore massive solution spaces simultaneously.
- **Quantum Entanglement**: Qubits can be entangled so that the state of one instantly dictates the state of another, creating exponential computational density (\`2^N\` states for N qubits).
- **The Threat to RSA Encryption**: Classical computers cannot factor large prime products in reasonable time. Shor's algorithm uses quantum Fourier transforms to factor primes in polynomial time, threatening traditional public-key encryption.
- **Post-Quantum Cryptography (PQC)**: Modern security protocols are already migrating to lattice-based and hash-based cryptographic algorithms that resist quantum attacks.

### Practical Recommendations
1. Organizations managing sensitive long-term data must adopt post-quantum cryptographic standards (e.g. NIST PQC algorithms like CRYSTALS-Kyber) today to prevent "harvest now, decrypt later" attacks.
2. Do not view quantum computers as faster general-purpose laptops—they are specialized machines for simulation, optimization, and prime factorization.`,
    blog: `# Quantum Computing and the Future of Cybersecurity

For decades, the foundation of digital privacy—from banking transactions to encrypted messaging—has relied on a simple mathematical asymmetry: multiplying two large prime numbers is easy, but factoring their product is practically impossible for classical computers.

Quantum computing is set to overturn that assumption.

## 1. What Makes Qubits Different?
In classical computing, a bit is a microscopic switch holding either a \`0\` or a \`1\`. In quantum mechanics:
- **Superposition**: A qubit can represent both \`|0⟩\` and \`|1⟩\` simultaneously with complex probability amplitudes.
- **Entanglement**: Two or more qubits become linked so that measuring one determines the state of the other, regardless of distance.

With just 300 fully entangled qubits, a quantum computer could hold more simultaneous states than there are atoms in the observable universe.

## 2. Shor's Algorithm and the End of RSA
In 1994, mathematician Peter Shor proved that a sufficiently large quantum computer could factor prime numbers in polynomial time using quantum phase estimation. This renders RSA and Elliptic Curve Cryptography (ECC) vulnerable to decryption.

## 3. The Migration to Post-Quantum Cryptography
Security agencies are not waiting for fault-tolerant quantum computers to arrive. Malicious actors are already executing "harvest now, decrypt later" strategies—intercepting encrypted traffic today to decrypt it when quantum hardware matures. The National Institute of Standards and Technology (NIST) has standardized quantum-resistant algorithms based on high-dimensional mathematical lattices.

## Conclusion
Quantum computing represents a profound paradigm shift in physics and computation. Understanding its capabilities and limitations is essential for securing the digital infrastructure of tomorrow.`,
    thread: `1/7 🧵 Could a Quantum Computer break all internet encryption?

Here is the truth about Qubits, Shor’s Algorithm, and the future of cybersecurity: 👇

---

2/7 ⚛️ Classical Bits vs Qubits
A classical computer bit is either ON (1) or OFF (0).
A quantum qubit exists in a superposition of BOTH states at once.
50 entangled qubits don't represent 50 states—they represent 1,125,899,906,842,624 states simultaneously.

---

3/7 🔐 Why RSA Encryption Works Today
When you buy something online, your data is locked with RSA.
Multiplying two 300-digit prime numbers takes a millisecond.
Factoring that product back into primes would take a supercomputer millions of years.

---

4/7 💥 How Shor’s Algorithm Changes the Game
In 1994, Peter Shor proved a quantum computer could crack prime factorization in minutes using quantum interference.
Every standard SSL certificate and crypto wallet would become vulnerable.

---

5/7 🕵️ The "Harvest Now, Decrypt Later" Threat
State actors are actively downloading and storing encrypted internet traffic today.
Why? So they can decrypt it in 10 years when quantum hardware reaches scale.

---

6/7 🛡️ The Solution: Post-Quantum Cryptography
NIST has already standardized quantum-proof encryption algorithms (like CRYSTALS-Kyber).
Instead of factoring primes, they rely on solving complex multi-dimensional geometric lattices that even quantum computers cannot crack.

---

7/7 💡 Bottom Line:
Quantum computers won't replace your MacBook for watching Netflix.
They are specialized reality simulators that will revolutionize drug discovery, materials science, and cryptography.`,
    segments: [
      { timeLabel: "00:00", text: "The classical bit vs. the quantum qubit: Superposition visualized." },
      { timeLabel: "04:10", text: "Understanding quantum entanglement and exponential state density." },
      { timeLabel: "08:30", text: "How RSA encryption secures modern banking and why factoring primes is hard." },
      { timeLabel: "13:15", text: "Peter Shor's breakthrough algorithm and quantum Fourier transforms." },
      { timeLabel: "17:40", text: "The engineering hurdles of quantum decoherence and error correction." },
      { timeLabel: "21:10", text: "Post-quantum cryptography standards and what developers must do today." },
    ]
  }
];
