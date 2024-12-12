// Stable Diffusion WebUI - Bracket Checker
// By @Bwin4L, @akx, @w-e-w, @Haoming02
// Counts open and closed brackets (round, square, curly) in the prompt and negative prompt text boxes in the txt2img and img2img tabs.
// If there's a mismatch, the keyword counter turns red, and if you hover on it, a tooltip tells you what's wrong.

(function() {
    const pairs = [
        ['(', ')', 'round brackets'],
        ['[', ']', 'square brackets'],
        ['{', '}', 'curly brackets']
    ];

    function checkBrackets(textArea, counterElem) {
        const counts = {};
        const errors = new Set();
        let i = 0;

        while (i < textArea.value.length) {
            let char = textArea.value[i];
            let escaped = false;
            while (char === '\\' && i + 1 < textArea.value.length) {
                escaped = !escaped;
                i++;
                char = textArea.value[i];
            }

            for (const [open, close, label] of pairs) {
                const lb = escaped ? `escaped ${label}` : label;

                if (char === open) {
                    counts[lb] = (counts[lb] || 0) + 1;
                } else if (char === close) {
                    counts[lb] = (counts[lb] || 0) - 1;
                    if (counts[lb] < 0) {
                        errors.add(`Incorrect order of ${lb}.`);
                    }
                }
            }

            i++;
        }

        for (const [open, close, label] of pairs) {
            if (counts[label] == undefined) {
                continue;
            }

            if (counts[label] > 0) {
                errors.add(`${open} ... ${close} - Detected ${counts[label]} more opening than closing ${label}.`);
            } else if (counts[label] < 0) {
                errors.add(`${open} ... ${close} - Detected ${-counts[label]} more closing than opening ${label}.`);
            }
        }

        for (const [open, close, label] of pairs) {
            const lb = `escaped ${label}`;
            if (counts[lb] == undefined) {
                continue;
            }

            const op = `\\${open}`;
            const cl = `\\${close}`;
            if (counts[lb] > 0) {
                errors.add(`${op} ... ${cl} - Detected ${counts[lb]} more opening than closing ${lb}.`);
            } else if (counts[lb] < 0) {
                errors.add(`${op} ... ${cl} - Detected ${-counts[lb]} more closing than opening ${lb}.`);
            }
        }

        counterElem.title = [...errors].join('\n');
        counterElem.classList.toggle('error', errors.size !== 0);
    }

    function setupBracketChecking(id_prompt, id_counter) {
        const textarea = gradioApp().querySelector(`#${id_prompt} > label > textarea`);
        const counter = gradioApp().getElementById(id_counter);

        if (textarea && counter) {
            onEdit(`${id_prompt}_BracketChecking`, textarea, 400, () => checkBrackets(textarea, counter));
        }
    }

    onUiLoaded(function() {
        setupBracketChecking('txt2img_prompt', 'txt2img_token_counter');
        setupBracketChecking('txt2img_neg_prompt', 'txt2img_negative_token_counter');
        setupBracketChecking('img2img_prompt', 'img2img_token_counter');
        setupBracketChecking('img2img_neg_prompt', 'img2img_negative_token_counter');
    });
})();
