document.addEventListener("DOMContentLoaded", function() {
    let currentIndex = 0;
    let images = ["static/inventory-pics/default/no-image.png"];

    const uploadButton = document.getElementById("upload-button");
    const fileInput = document.getElementById("item-image");
    const imagePreview = document.getElementById("item-image-preview");
    const removeButton = document.getElementById("remove-button");
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");

    uploadButton.addEventListener("click", function() {
        fileInput.click();
    });

    fileInput.addEventListener("change", function() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                images.push(e.target.result);
                currentIndex = images.length - 1;
                displayImage(currentIndex);
            };
            reader.readAsDataURL(file);
        }
    });

    removeButton.addEventListener("click", function() {
        if (currentIndex > 0) {
            images.splice(currentIndex, 1);
            currentIndex--;
            displayImage(currentIndex);
        } 
    });

    leftArrow.addEventListener("click", function() {
        if (images.length > 1) {
            currentIndex = (currentIndex + images.length - 1) % images.length;
            displayImage(currentIndex);
        }
    });

    rightArrow.addEventListener("click", function() {
        if (images.length > 1) {
            currentIndex = (currentIndex + 1) % images.length;
            displayImage(currentIndex);
        }
    });

    function displayImage(index) {
        imagePreview.src = images[index];
        imagePreview.style.display = "block";
        console.log(index);
    }


});