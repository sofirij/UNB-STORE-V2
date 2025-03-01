document.addEventListener("DOMContentLoaded", function() {
    // Initialize images and currentIndex arrays
    const images = {};
    const currentIndex = {};
    const originalValues = {};
    const newFiles = [];
    const defaultImage = "/static/inventory-pics/default/no-image.png";

    // Initialize images, original values and currentIndex for each item
    document.querySelectorAll("[id^='inventory-form-']").forEach(function (form) {
        const itemId = form.id.split("-")[2];
        const imageSources = form.dataset.imageSources === "[]" ? [] : form.dataset.imageSources.slice(2, -2).split("', '");
        images[itemId] = [];

        if (imageSources.length > 0) {
            currentIndex[itemId] = 0;
        } else {
            currentIndex[itemId] = -1;
        }
        
        originalValues[itemId] = { fields: {}, images: [] };
        imageSources.forEach((src) => {
            images[itemId].push(src);
            originalValues[itemId].images.push(src);
        });

        // Store original values
        form.querySelectorAll("input, select, textarea").forEach(function (input) {
            originalValues[itemId].fields[input.id] = input.value
        });

        console.log(imageSources);
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
                newFiles.push(file)
                displayImage(itemId, currentIndex[itemId], imagePreview);
                console.log(images[itemId]);

            };
            reader.readAsDataURL(file);
        }
    }

    // Function to display image
    function displayImage(itemId, index, imagePreview) {
        if (index >= 0 && index < images[itemId].length)
        {
            imagePreview.src = images[itemId][index];
            imagePreview.style.display = "block";
        }
        else
        {
            imagePreview.src = defaultImage;
            imagePreview.style.display = "block";
        }

        console.log(`Item ID: ${itemId}, Image Index: ${index}`);
    }

    // Function to handle edit button clicked
    function handleEditButtonClick(event) {
        console.log("Edit button clicked");
        const button = event.target;
        const itemId = button.id.split("-")[1];
        toggleEditMode(itemId);
    }


    // Function to handle save button clicked
    function handleSaveButtonClick(event) {
        console.log("Save button clicked");
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);
        const dbItemId = form.dataset.dbItemId;
        const originalImages = images[itemId].filter((image) => originalValues[itemId].images.includes(image));
        const originalFilenames = [];
        originalImages.forEach((image) => {
            originalFilenames.push(image.split("/").slice(-1)[0]);
        });



        // update original values
        form.querySelectorAll("input, select, textarea").forEach(function (input) {
            originalValues[itemId].fields[input.id] = input.value;
        });
        originalValues[itemId].images = [...images[itemId]]

        // Send AJAX request to update the information in the database
        const formData = new FormData(form);
        newFiles.forEach(file => {
            formData.append('new-images', file);
        });
        originalFilenames.forEach((filename) => {
            formData.append("original-filenames", filename);
        });
        formData.append("name-id", itemId);

        fetch(`/inventory/update/${dbItemId}`, {
            method: "PUT",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            toggleEditMode(itemId);
            newFiles.length = 0;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }


    // Function to handle cancel button click
    function handleCancelButtonClick(event) {
        console.log("Cancel button clicked");
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);

        // reset form fields to original values
        form.querySelectorAll("input, select, textarea").forEach(function (input) {
            input.value = originalValues[itemId].fields[input.id];
        });

        // reset images to original values
        images[itemId] = [...originalValues[itemId].images];
        currentIndex[itemId] = 0;
        displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));

        toggleEditMode(itemId);
    }

    // Function to handle delete button click
    function handleDeleteButtonClick(event) {
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);
        const dbItemId = form.dataset.dbItemId;
        console.log(dbItemId);

        // Send AJAX request to the backed to delete the item
        fetch(`/inventory/delete/${dbItemId}`, {
            method: "DELETE",
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
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
            if (!input.id.includes("-arrow-")) {
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

    // Attach event listeners to all dynamic elements
    function attachEventListeners() {
        const uploadButtons = document.querySelectorAll("[id^='upload-button-']");
        const removeButtons = document.querySelectorAll("[id^='remove-button-']");
        const imageInputs = document.querySelectorAll("[id^='item-image-']");
        const editButtons = document.querySelectorAll("[id^='edit-']");
        const saveButtons = document.querySelectorAll("[id^='save-']");
        const cancelButtons = document.querySelectorAll("[id^='cancel-']");
        const leftArrowButtons = document.querySelectorAll("[id^='left-arrow-']");
        const rightArrowButtons = document.querySelectorAll("[id^='right-arrow-']");
        const deleteButtons = document.querySelectorAll("[id^='delete-']");
        const addItemButton = document.getElementById("add-item");
        const newItemForm = document.getElementById("inventory-form-0");

        // for the upload button
        uploadButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                const itemId = button.id.split("-")[2];
                document.getElementById(`item-image-${itemId}`).click();
            });
        });

        // for the remove image button
        removeButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                const itemId = button.id.split('-')[2];
                if (images[itemId].length > 0)
                {
                    images[itemId].splice(currentIndex[itemId], 1);
                    if (images[itemId].length === 0) {
                        currentIndex[itemId] = -1;
                    }
                    else {
                        currentIndex[itemId] = currentIndex[itemId] % images[itemId].length;
                    }
                    displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
                }
            });
        });

        // for when the file input is changed
        imageInputs.forEach(function(input) {
            input.addEventListener("change", handleImageUpload);
        });

        // for the edit button
        editButtons.forEach(function(button) {
            button.addEventListener("click", handleEditButtonClick);
        });

        //for the save button
        saveButtons.forEach(function(button) {
            button.addEventListener("click", handleSaveButtonClick);
        });

        // for the cancel button
        cancelButtons.forEach(function(button) {
            button.addEventListener("click", handleCancelButtonClick);
        });

        // for the left arrow button
        leftArrowButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                console.log("Left arrow clicked");
                const itemId = button.id.split('-')[2];;
                if (images[itemId].length > 1) {
                    currentIndex[itemId] = (currentIndex[itemId] + images[itemId].length - 1) % images[itemId].length;
                    displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
                }
            });
        });

        // for the right arrow button
        rightArrowButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                console.log("Right arrow clicked");
                const itemId = button.id.split('-')[2];
                if (images[itemId].length > 1) {
                    currentIndex[itemId] = (currentIndex[itemId] + 1) % images[itemId].length;
                    displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
                }
            });
        });

        // for the delete button
        deleteButtons.forEach(function(button) {
            button.addEventListener("click", handleDeleteButtonClick)
        });

        // to show the new form when the add new item button is clicked
        if (addItemButton) {
            addItemButton.addEventListener("click", function() {
                console.log("Add new item button clicked");
                const main = document.getElementById("main");
                let categories;
                
                // make AJAX request to get the categories
                fetch('/api/categories', {
                    method: 'GET',
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    categories = data.categories.map(category => `<option value="${category}">${category}</option>`).join("");

                    // add the new item form to the page
                    const itemFormToAdd = `<form id="inventory-form-0" action="/inventory/add" method="POST" enctype="multipart/form-data" data-image-sources="[]">
                    <div class="item-container mb-3">
                        <div class="category-container mb-3">
                            <select class="form-control mx-auto w-auto" id="categories-0" name="categories-0" required>
                                <option value="" disabled selected>Select item category</option>
                                ${categories}
                            </select>
                        </div>
                        <div class="item-info mb-3">
                            <div class="image-upload mb-3">
                                <button type="button" id="upload-button-0" class="btn btn-primary">+</button>
                                <button type="button" id="remove-button-0" class="btn btn-primary">-</button>
                            </div>

                            <div class="image-slide">
                                <button type="button" id="left-arrow-0" class="btn btn-secondary">&lt;</button>
                            </div>

                            <div class="item-info-image mb-3">
                                <img id="item-image-preview-0" src="static/inventory-pics/default/no-image.png" alt="placeholder" style="margin-top: 10px;">
                                <input type="file" id="item-image-0" name="item-image-0" accept="image/*" style="display: none;" multiple>
                            </div>

                            <div class="image-slide">
                                <button type="button" id="right-arrow-0" class="btn btn-secondary">&gt;</button>
                            </div>
                            
                            <div class="item-info-text mb-3">
                                <input class="form-control mx-auto w-auto" type="text" required id="item-name-0" name="item-name-0" placeholder="Item name">
                                <input class="form-control mx-auto w-auto" type="text" required id="item-price-0" name="item-price-0" placeholder="Item price">
                                <input class="form-control mx-auto w-auto" type="number" required id="item-quantity-0" name="item-quantity-0"  placeholder="Item quantity">
                            </div>    
                        </div>
                        <div class="item-description mb-3">
                            <label for="item-description-0">Description:</label>
                            <textarea class="form-control mx-auto w-auto" required id="item-description-0" name="item-description-0" rows="2" cols="50"></textarea>
                        </div>
                        <div class="options-container mb-3">
                            <button id="add-0" name="add-0" type="submit" class="btn btn-primary">Add item</button>
                        </div>
                    </div>
                </form>`;
                main.insertAdjacentHTML("beforeend", itemFormToAdd);

                itemId = 0;
                images[itemId] = [];
                currentIndex[itemId] = -1;
                displayImage(images[itemId], currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
                attachEventListeners();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });   
            });
        }

        // for the add new item button
        if (newItemForm) {
            newItemForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const form = event.target;
                const itemId = form.id.split('-')[2];
    
                if (!ensureIsDigit(document.getElementById(`item-price-${itemId}`))) {
                    return;
                }
                
                // send AJAX request to the backend to add the item
                const formData = new FormData(form);
                newFiles.forEach(file => {
                    formData.append('images', file);
                });
    
                fetch('inventory/add', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    location.reload();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
        }   
    }

    attachEventListeners();
});