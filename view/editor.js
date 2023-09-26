document.addEventListener("DOMContentLoaded", function() {

  var quill = new Quill('#editor', {
    modules: {
      toolbar: false
    }
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
      // console.log(`delta.ops: ${JSON.stringify(delta.ops, null, 2)}`);
      let position = 0;
      delta.ops.forEach(function(op) {
        if (op.hasOwnProperty('retain')) {
          position += op.retain;
        } else if (op.hasOwnProperty('insert')) {
          for (let i = 0; i < op.insert.length; i++) {
            let char = op.insert[i];
            if (symbol_mapping.hasOwnProperty(char)) {
              quill.deleteText(position + i, 1);
              quill.insertText(position + i, symbol_mapping[char]);
            }
          }
        }
      });
    }
  });

  // Set the color of the specified line to red
  // console.log('error_line:', error_line);
  // if (error_line >= 0) {
  //   const line = quill.container.childNodes[0].getElementsByTagName('p')[error_line];
  //   if (line) {
  //     line.style.color = 'red';
  //   }
  // }

  document.getElementById("submit-button").addEventListener("click", function() {
    const content = quill.root.innerHTML;

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
