from flask import Flask, redirect, render_template, request, session, jsonify
from flask_session import Session
from helpers import login_required
from dotenv import load_dotenv
from datetime import timedelta
from functions import *
import os

load_dotenv()

# configure application
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key")

# configure session to use filesystem
app.config["SESSION PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

# set the session lifetime
app.permanent_session_lifetime = timedelta(minutes=60)

# create session
Session(app)

@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    """"Give users the option to search for items in inventory"""
    return render_template("index.html")

@app.after_request
def after_request(response):
    """ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/register", methods=["GET"])
def register():
    """Display the registration form for users to input information"""
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    """Allow already registered users to login to their account"""
    if request.method == "POST":
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if loginUser(username, password):
            session["user_id"] = getUserId(username)
            session["display_name"] = getDisplayName(username)
            session["profile_pic"] = getProfilePic(username)
            return jsonify({"successful": True})
        else:
            return jsonify({"successful": False})
    else:
        return render_template("login.html")

@app.route("/registerUser", methods=["POST"])
def registerUser():
    """"Validate that the registered username is not already in use and register the user"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    displayName = data.get('displayName')
    
    invalids = registerUsername(username, password, displayName)
    
    if not invalids:
        return jsonify({"successful": True})
    else:
        return jsonify({"successful": False, "invalids": invalids})

@app.route("/logout", methods=["GET"])
def logout():
    """Clear the users session"""
    session.clear()
    return redirect("/")

@app.route("/profile", methods=["GET"])
@login_required
def profile():
    """"Allow users to manage information about their profile"""
    return render_template("profile.html")

@app.route("/inventory", methods=["GET"])
@login_required
def inventory():
    """"Display the inventory of the user and allow the user to edit their inventory"""
    user_id = session["user_id"]
    inventory = getUserInventory(user_id)
    item_ids = getItemIds(user_id)
    inventory = zip(inventory, item_ids)
    return render_template("inventory.html", inventory=inventory, filenames=CATEGORIES, isEmpty=item_ids == [])

@app.route("/inventory/update/<int:item_id>", methods=["PUT"])
@login_required
def updateInventory(item_id):
    """"Update the inventory of the user"""
    id = request.form.get("name-id")
    category = request.form.get(f"categories-{id}")
    name = request.form.get(f"item-name-{id}")
    price = request.form.get(f"item-price-{id}")
    quantity = request.form.get(f"item-quantity-{id}")
    description = request.form.get(f"item-description-{id}")
    originalImages = request.form.getlist("original-filenames")
    newImages = request.files.getlist("new-images")
    fileExtensions = [image.filename.split('.')[-1] for image in newImages]
    
    
    # Validate files
    for image in newImages:
        if not isImage(image):
            return jsonify({"successful": False, "message": "Please upload only images"})
        if not isValidSize(image):
            return jsonify({"successful": False, "message": "Please upload images less than 10MB"})
        if not isValidExtension(image.filename):
            return jsonify({"successful": False, "message": "Invalid file extension"})
    
    # delete images from file system that are not in original images
    path = os.path.join('static', 'inventory-pics', f'user-{session["user_id"]}')
    pattern = re.compile(f'^{item_id}.*')
    originalFilenames = [filename for filename in os.listdir(path) if pattern.match(filename)]
    for filename in originalFilenames:
        if filename not in originalImages:
            os.remove(os.path.join(path, filename))
            originalFilenames.remove(filename)
            
    # Create a list of new filenames using the item_id and the index
    newImageFilenames = createFilenames(fileExtensions, item_id)
    
    # Create new list of filenames to save
    filenamesToSave = newImageFilenames.copy()
    for filename in originalImages:
        if filename in originalFilenames:
            filenamesToSave.append(filename)
    
    # Update the info in that row with the new filenames and other item info
    updateItemDetails(item_id, category, name, price, quantity, description, filenamesToSave)
    
    # Store files in the file system
    for image, filename in zip(newImages, newImageFilenames):
        image.save(os.path.join('static', 'inventory-pics', f'user-{session["user_id"]}', filename))
        
    return jsonify({"successful": True})

@app.route("/inventory/delete/<int:item_id>", methods=["DELETE"])
@login_required
def deleteInventory(item_id):
    """"Delete an item from the inventory of the user""" 
    userId = session["user_id"] 
    deleteFromInventory(item_id)
    imageFilenames = getImageFilenames(item_id)
    deleteFromFileSystem(imageFilenames, userId)
    return jsonify({"successful": True})

@app.route("/inventory/add", methods=["POST"])
@login_required
def addInventory():
    """"Add an item to the inventory of the user"""
    user_id = session["user_id"]
    category = request.form.get("categories-0")
    name = request.form.get("item-name-0")
    price = request.form.get("item-price-0")
    quantity = request.form.get("item-quantity-0")
    description = request.form.get("item-description-0")
    images = request.files.getlist("images")
    fileExtensions = [image.filename.split('.')[-1] for image in images]
    
    # Validate files
    for image in images:
        if not isImage(image):
            return jsonify({"successful": False, "message": "Please upload only images"})
        if not isValidSize(image):
            return jsonify({"successful": False, "message": "Please upload images less than 10MB"})
        if not isValidExtension(image.filename):
            return jsonify({"successful": False, "message": "Invalid file extension"})
    
    # Insert a new user_id into the database and return the new item_id
    item_id = newItemToInventory(user_id)
    
    # Then create a list of new filenames using the item_id and the index
    image_filenames = createFilenames(fileExtensions, item_id)
    
    # Then update the info in that row with the new filenames and other item info 
    updateItemDetails(item_id, category, name, price, quantity, description, image_filenames)
    
    # Store files in the file system
    for image, filename in zip(images, image_filenames):
        image.save(os.path.join('static', 'inventory-pics', f'user-{user_id}', filename))
    return jsonify({"successful": True})

@app.route("/api/categories", methods=["GET"])
def getCategories():
    return jsonify({"categories":CATEGORIES, "successful": True})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)  