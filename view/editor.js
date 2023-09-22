document.addEventListener("DOMContentLoaded", function() {

  var quill = new Quill('#editor', {
    modules: {
      toolbar: false
    },
    formats: []
  });

  var symbol_mapping = {
    ">": "→",
    "~": "¬",
    "=": "↔",
    "v": "∨",
    "&": "∧"
  };

  quill.on('text-change', function(delta, oldDelta, source) {
    if (source === 'user') {
      let position = 0;
      delta.ops.forEach(function(op) {
        if (typeof op.insert !== 'undefined') {
          // Check each inserted character
          for (let i = 0; i < op.insert.length; i++) {
            const char = op.insert[i];
            if (symbol_mapping.hasOwnProperty(char)) {
              quill.deleteText(position + i, position + i + 1);
              quill.insertText(position + i, symbol_mapping[char]);
            }
          }
        }
        if (typeof op.retain !== 'undefined') {
          position += op.retain;
        }
        if (typeof op.delete !== 'undefined') {
          // We don't adjust position for delete,
          // as it will be at the end of the operation
        }
      });
    }
  });

  document.getElementById("submit-button").addEventListener("click", function() {
    const content = quill.getText();

    // Create form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = this.getAttribute("data-endpoint");

    // Create hidden input element
    const hiddenField = document.createElement("input");
    hiddenField.type = "hidden";
    hiddenField.name = "raw";
    hiddenField.value = content;

    // Add hidden input to form
    form.appendChild(hiddenField);

    // Append form to DOM and submit
    document.body.appendChild(form);
    form.submit();
  });

});
