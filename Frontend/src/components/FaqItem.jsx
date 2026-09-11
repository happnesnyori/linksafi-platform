import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`ls-faq-item ${open ? 'open' : ''}`}>
            <button
                type="button"
                className="ls-faq-trigger"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
            >
                <span className="ls-faq-question">{question}</span>
                <span className="ls-faq-icon" aria-hidden="true">
                    {open ? <Minus size={18} /> : <Plus size={18} />}
                </span>
            </button>
            <div className="ls-faq-content" hidden={!open}>
                <p>{answer}</p>
            </div>
        </div>
    );
}
