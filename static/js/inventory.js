document.addEventListener("DOMContentLoaded", function() {
    // Initialize images and currentIndex arrays
    const images = {};
    const currentIndex = {};
    const originalValues = {};
    const newFiles = [];

    // Initialize images, original values and currentIndex for each item
    document.querySelectorAll("[id^='inventory-form-']").forEach(function (form) {
        const itemId = form.id.split("-")[2];
        images[itemId] = [];
        currentIndex[itemId] = 0;
        originalValues[itemId] = { fields: {}, images: [] };
        const imageElements = form.querySelectorAll(`img[id^='item-image-preview-${itemId}']`);
        imageElements.forEach(function(img) {
            images[itemId].push(img.src);
            originalValues[itemId].images.push(img.src);
        });

        // Store original values
        form.querySelectorAll("input, select, textarea").forEach(function (input) {
            originalValues[itemId].fields[input.id] = input.value
        });
    });

    // Function to handle image upload
    function handleImageUpload(event) {
        const fileInput = event.target;
        const file = fileInput.files[0];
        const itemId = fileInput.id.split('-')[2];
        const imagePreview = document.getElementById(`item-image-preview-${itemId}`);
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                images[itemId].push(e.target.result);
                currentIndex[itemId] = images[itemId].length - 1;
                newFiles.push({image: file, index: currentIndex[itemId]})
                displayImage(itemId, currentIndex[itemId], imagePreview);

            };
            reader.readAsDataURL(file);
        }
    }

    // Function to display image
    function displayImage(itemId, index, imagePreview) {
        imagePreview.src = images[itemId][index];
        imagePreview.style.display = "block";
        console.log(`Item ID: ${itemId}, Image Index: ${index}`);
    }

    // Function to handle edit button clicked
    function handleEditButtonClick(event) {
        const button = event.target;
        const itemId = button.id.split("-")[1];
        toggleEditMode(itemId);
    }


    // Function to handle save button clicked
    function handleSaveButtonClick(event) {
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);

        // update original values
        form.querySelectorAll("input, select, text").forEach(function (input) {
            originalValues[itemId].fields[input.id] = input.value;
        });
        originalValues[itemId].images = [...images[itemId]]

        // Send AJAX request to update the information in the database
        const formData = new FormData(form);
        const fileInput = document.getElementById(`item-image-${itemId}`);
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('images', fileInput.files[i]);
        }
        formData.append('image_filenames', JSON.stringify(images[itemId].slice(1)));

        fetch(`/inventory/update/${itemId}`, {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            toggleEditMode(itemId);
            newFiles = [];
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }


    // Function to handle cancel button click
    function handleCancelButtonClick(event) {
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);

        // reset form fields to original values
        form.querySelectorAll("input, select< textarea").forEach(function (input) {
            input.value = originalValues[itemId].fields[input.id];
        });

        // reset images to original values
        images[item] = [...originalValues[itemId].images];
        currentIndex[itemId] = 0;
        displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));

        toggleEditMode(itemId);
    }

    // Function to handle delete button click
    function handleDeleteButtonClick(event) {
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);

        // Send AJAX request to the backed to delete the item
        fetch(`/inventory/delete/${itemId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({item_id: itemId})
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            //remove the item from the DOM
            const form = document.getElementById(`inventory-form-${itemId}`);
            form.remove();
        })
        .catch((error) => {
            console.errror('Error:', error);
        });
    }

    // Function to toggle edit mode
    function toggleEditMode(itemId) {
        const form = document.getElementById(`inventory-form-${itemId}`);
        const inputs = form.querySelectorAll("input, select, textarea, button");
        const editButton = document.getElementById(`edit-${itemId}`);
        const deleteButton = document.getElementById(`delete-${itemId}`);
        const saveButton = document.getElementById(`save-${itemId}`);
        const cancelButton = document.getElementById(`cancel-${itemId}`);

        inputs.forEach(function(input) {
            if (input.type !== "button" && input.type !== "submit") {
                input.disabled = !input.disabled;
            }
        });

        if (saveButton.style.display === "none") {
            saveButton.style.display = "block";
            cancelButton.style.display = "block";
            editButton.style.display = "none";
            deleteButton.style.display = "none";
        } else {
            saveButton.style.display = "none";
            cancelButton.style.display = "none";
            editButton.style.display = "block";
            deleteButton.style.display = "block";
        }
    };
    
    // Function to ensure the input is a digit
    function ensureIsDigit(input) {
        const value = input.value;
        const isValid = /^\d+(\.\d+)?$/.test(value); // Regular expression to match digits and optional decimal point
        if (!isValid) {
            alert("Please enter a valid item price (must be a number)");
            input.focus();
            return false;
        }
        return true;
    }


    // Add event listeners for all dynamic elements
    // for the upload button
    document.querySelectorAll("[id^='upload-button-']").forEach(function(button) {
        button.addEventListener("click", function() {
            const itemId = button.id.split("-")[2];
            document.getElementById(`item-image-${itemId}`).click();
        });
    });

    // for the remove image button
    document.querySelectorAll("[id^='remove-button-']").forEach(function(button) {
        button.addEventListener("click", function() {
            const itemId = button.id.split('-')[2];
            if (currentIndex[itemId] > 0)
            {
                images[itemId].splice(currentIndex[itemId], 1);
                currentIndex[itemId]--;
                displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
            }
        });
    });

    // for when the file input is changed
    document.querySelectorAll("[id^='item-image-']").forEach(function(input) {
        input.addEventListener("change", handleImageUpload);
    });

    // for the edit button
    document.querySelectorAll("[id^='edit-']").forEach(function(input) {
        button.addEventListener("click", handleEditButtonClick);
    });

    // for the cancel button
    document.querySelectorAll("[id='cancel-']").forEach(function(button) {
        button.addEventListener("click", handleCancelButtonClick);
    });

    // for the left arrow button
    document.querySelectorAll("[id^='left-arrow-']").forEach(function(button) {
        button.addEventListener("click", function() {
            const itemId = button.id.split('-')[2];;
            if (images[itemId].length > 1) {
                currentIndex[itemId] = (currentIndex[itemId] + images[itemId].length - 1) % images[itemId].length;
                displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
            }
        });
    });

    // for the right arrow button
    document.querySelectorAll("[id^='right-arrow-']").forEach(function(button) {
        button.addEventListener("click", function() {
            const itemId = button.id.split('-')[2];
            if (images[itemId].length > 1) {
                currentIndex[itemId] = (currentIndex[itemId] + 1) % images[itemId].length;
                displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
            }
        });
    });

    // for the delete button
    document.querySelectorAll("[id^='delete-']").forEach(function(button) {
        button.addEventListener("click", handleDeleteButtonClick)
    });

    // for the add new item button
    document.getElementById("inventory-form-0").addEventListener("submit", function (event) {
        event.preventDefault();
        const form = event.target;
        const itemId = form.id.split('-')[2];

        if (!ensureIsDigit(document.getElementById(`item-price-${itemId}`))) {
            return;
        }
        
        // send AJAX request to the backend to add the item
        const formData = new FormData(form);
        newFiles.forEach(file => {
            formData.append('images', file.image);
            formData.append('indexes', file.index);
            console.log(`FileSizeInBytes: ${file.image.size} bytes`);
        });

        fetch('inventory/add', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
    
});