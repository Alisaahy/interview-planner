export const MOCK_JOBS = [
    {
        id: '1',
        company: 'Amazon Web Services',
        role: 'UX Designer',
        status: 'Applying',
        location: 'Sunnyvale, CA',
        workModel: 'Remote',
        type: 'Full-time',
        salary: '$117,800.00/yr - $184,000.00/yr',
        experience: '5+ years of design experience',
        workAuth: 'Authorized to work in the US',
        keySkills: ['Computer vision', 'Sensor fusion', 'Machine learning'],
        benefits: ['Health insurance', '401(k) matching', 'Paid time off'],
        companyDesc: 'Innovation is part of our DNA. We need people who want to join a high-reaching program...'
    },
    {
        id: '2',
        company: 'Google',
        role: 'Frontend Engineer',
        status: 'Interviewing',
        location: 'Mountain View, CA',
        workModel: 'Hybrid',
        type: 'Full-time'
    },
    {
        id: '3',
        company: 'Meta',
        role: 'Product Designer',
        status: 'Applying',
        location: 'Menlo Park, CA',
        workModel: 'On-site',
        type: 'Full-time'
    }
];

export const MOCK_RESUME = {
    name: "Tina L",
    skills: ['React', 'Figma', 'UX Research', 'Prototyping'],
    experience: [
        { title: 'Product Designer', company: 'Startup Inc', years: '2020-2023' }
    ]
};

export const QUESTION_BANKS = {
    behavior: [
        "Tell me about a time you failed.",
        "Describe a situation where you had to work with a difficult coworker.",
        "How do you handle tight deadlines?",
        "Tell me about a time you showed leadership.",
        "How do you prioritize your work?"
    ],
    product: [
        "How would you improve Google Maps?",
        "Design an elevator system.",
        "How would you measure the success of Instagram Reels?",
        "What is your favorite product and why?",
        "How would you design a smart coffee maker?"
    ],
    technical_stats: [
        "Explain the central limit theorem.",
        "What is a p-value?",
        "How do you check for multicollinearity?",
        "Explain Type I and Type II errors.",
        "What is Simpson's Paradox?"
    ],
    technical_ab: [
        "How long should you run an A/B test?",
        "What is a network effect in A/B testing?",
        "How do you handle the novelty effect?",
        "What would you do if the p-value is 0.051?",
        "How do you choose primary and secondary metrics?"
    ],
    technical_ml: [
        "Explain the bias-variance tradeoff.",
        "How does a random forest work?",
        "What is L1 vs L2 regularization?",
        "How do you handle imbalanced datasets?",
        "Explain the ROC curve and AUC."
    ],
    technical_dl: [
        "What is the vanishing gradient problem?",
        "Explain backpropagation.",
        "What is a Convolutional Neural Network (CNN)?",
        "What are the advantages of Transformers over RNNs?",
        "Explain the concept of Dropout."
    ]
};
