const staticFAQs = [
    {
        question: "How do I reset my password?",
        answer: "To reset your password, go to the login page and click on 'Forgot Password'. Follow the instructions sent to your email."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and Apple Pay."
    },
    {
        question: "Can I cancel my subscription?",
        answer: "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of the billing period."
    },
    {
        question: "How do I contact support?",
        answer: "You can reach our support team via email at support@example.com or use the live chat feature on our website."
    },
    {
        question: "Is there a free trial available?",
        answer: "Yes, we offer a 14-day free trial for new users. No credit card is required to sign up."
    }
];

// Your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyCbKb-IgpXw_Wa6xPyNupShd4tVd3Wp6z0';

// ✅ FIX: use an active 2.5 model instead of retired 1.5/pro
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

document.addEventListener('DOMContentLoaded', () => {
    const faqList = document.getElementById('faq-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const aiContainer = document.getElementById('ai-response-container');
    const aiContent = document.getElementById('ai-content');
    const aiLoading = document.querySelector('.ai-loading');

    // Render Static FAQs
    function renderFAQs(faqs) {
        faqList.innerHTML = faqs.map((faq, index) => `
            <div class="faq-item">
                <div class="faq-question" onclick="toggleAccordion(this)">
                    ${faq.question}
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `).join('');
    }

    renderFAQs(staticFAQs);

    // Toggle Accordion
    window.toggleAccordion = (element) => {
        const item = element.parentElement;
        const isActive = item.classList.contains('active');

        // Close all other items
        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('active');
        });

        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    };

    // Search Functionality
    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();

        if (!query) {
            renderFAQs(staticFAQs);
            aiContainer.classList.add('hidden');
            return;
        }

        // Filter static FAQs
        const filtered = staticFAQs.filter(faq =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        );

        renderFAQs(filtered);

        // Always try AI for any non-empty query
        fetchAIAnswer(query);
    }

    async function fetchAIAnswer(query) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
            aiContainer.classList.remove('hidden');
            aiContent.innerHTML = '<div style="color: #ef4444; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">⚠️ <strong>Setup Required:</strong> Please open <code>script.js</code> and add your Gemini API key to line 25.</div>';
            return;
        }

        aiContainer.classList.remove('hidden');
        aiContent.innerHTML = '';
        aiLoading.classList.remove('hidden');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a helpful customer support assistant for a generic tech company. Answer this question concisely (max 2-3 sentences): ${query}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            console.log('Gemini API Response:', data); // Debug log

            if (!response.ok) {
                throw new Error(data.error?.message || `API Error: ${response.statusText}`);
            }

            if (data.candidates && data.candidates[0].content) {
                const answer = data.candidates[0].content.parts[0].text;
                aiContent.innerHTML = answer;
            } else {
                console.warn('No candidates returned', data);
                let message = "I couldn't find an answer to that question.";
                if (data.promptFeedback) {
                    message += ` (Feedback: ${JSON.stringify(data.promptFeedback)})`;
                }
                aiContent.innerHTML = message;
            }
        } catch (error) {
            console.error('Error fetching AI response:', error);
            aiContent.innerHTML = `<div style="color: #ef4444;">Sorry, something went wrong: ${error.message}</div>`;
        } finally {
            aiLoading.classList.add('hidden');
        }
    }

    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Debounce search input for static filtering
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                renderFAQs(staticFAQs);
                aiContainer.classList.add('hidden');
            } else {
                const filtered = staticFAQs.filter(faq =>
                    faq.question.toLowerCase().includes(query) ||
                    faq.answer.toLowerCase().includes(query)
                );
                renderFAQs(filtered);
            }
        }, 300);
    });
});
