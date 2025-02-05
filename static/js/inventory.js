document.addEventListener("DOMContentLoaded", function() {
    const uploadButton = document.getElementById("upload-button");
    const fileInput = document.getElementById("item-image");
    const imagePreview = document.getElementById("item-image-preview");

    uploadButton.addEventListener("click", function() {
        fileInput.click();
    });

    fileInput.addEventListener("change", function() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block";
                removeButton.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    removeButton.addEventListener("click", function() {
        fileInput.value = "";
        imagePreview.src = "{{ url_for('static', filename='profile-pics/default.png') }}";
        imagePreview.style.display = "none";
        removeButton.style.display = "none";
    });
});