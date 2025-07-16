let promptTokenCountUpdateFunctions = {};

function update_txt2img_tokens(...args) {
    // Called from Gradio
    update_token_counter("txt2img_token_button");
    update_token_counter("txt2img_negative_token_button");
    if (args.length == 2) {
        return args[0];
    }
    return args;
}

function update_img2img_tokens(...args) {
    // Called from Gradio
    update_token_counter("img2img_token_button");
    update_token_counter("img2img_negative_token_button");
    if (args.length == 2) {
        return args[0];
    }
    return args;
}

function update_token_counter(button_id) {
    promptTokenCountUpdateFunctions[button_id]?.();
}


function recalculatePromptTokens(name) {
    promptTokenCountUpdateFunctions[name]?.();
}

function recalculate_prompts_txt2img() {
    // Called from Gradio
    recalculatePromptTokens('txt2img_prompt');
    recalculatePromptTokens('txt2img_neg_prompt');
    return Array.from(arguments);
}

function recalculate_prompts_img2img() {
    // Called from Gradio
    recalculatePromptTokens('img2img_prompt');
    recalculatePromptTokens('img2img_neg_prompt');
    return Array.from(arguments);
}

function setupTokenCounting(id, id_counter, id_button) {
    var prompt = gradioApp().getElementById(id);
    var counter = gradioApp().getElementById(id_counter);
    var textarea = gradioApp().querySelector(`#${id} > label > textarea`);

    if (counter.parentElement == prompt.parentElement) {
        return;
    }

    prompt.parentElement.insertBefore(counter, prompt);
    prompt.parentElement.style.position = "relative";

    var func = onEdit(id, textarea, 800, function() {
        if (counter.classList.contains("token-counter-visible")) {
            gradioApp().getElementById(id_button)?.click();
        }
    });
    promptTokenCountUpdateFunctions[id] = func;
    promptTokenCountUpdateFunctions[id_button] = func;
}

function toggleTokenCountingVisibility(id, id_counter, id_button) {
    var counter = gradioApp().getElementById(id_counter);

    counter.style.display = opts.disable_token_counters ? "none" : "block";
    counter.classList.toggle("token-counter-visible", !opts.disable_token_counters);
}

function runCodeForTokenCounters(fun) {
    fun('txt2img_prompt', 'txt2img_token_counter', 'txt2img_token_button');
    fun('txt2img_neg_prompt', 'txt2img_negative_token_counter', 'txt2img_negative_token_button');
    fun('img2img_prompt', 'img2img_token_counter', 'img2img_token_button');
    fun('img2img_neg_prompt', 'img2img_negative_token_counter', 'img2img_negative_token_button');
}

function confirm_token_counter_synchronize(prompt, steps, ui_styles, token_counter_params_json, button_id) {
    // Called from Gradio
    let params;
    try {
        params = JSON.parse(token_counter_params_json);
    } catch (e) {
        console.warn("Invalid JSON:", e);
        return;
    }

    if (
        prompt !== params.prompt ||
        steps !== params.steps ||
        JSON.stringify(ui_styles) !== JSON.stringify(params.styles)
    ) {
        const button = document.getElementById(button_id);
        if (button instanceof HTMLElement) {
            button.click();
        } else {
            console.warn("Button not found or not an HTMLElement:", button_id);
        }
    }
}

onUiLoaded(function() {
    runCodeForTokenCounters(setupTokenCounting);
});

onOptionsChanged(function() {
    runCodeForTokenCounters(toggleTokenCountingVisibility);
});
