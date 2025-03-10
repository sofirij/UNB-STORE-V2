import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash
from flask import url_for
import json
import re
import os
import uuid
from PIL import Image

# List of valid categories
CATEGORIES = ["books-and-study-materials", "clothing-and-accessories", "electronics-and-gadgets", "furniture-and-home-essentials", "miscellaneous", "services", "sports-and-fitness", "transportation-and-mobility"]




# List of valid image extensions
ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif"]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def registerUsername(username, password, displayName):
    """"Register new user to the database"""
    invalids = []
    if not validateUsername(username) or not validatePassword(password):
        invalids.append("Invalid username or password")
        return invalids
    
    if usernameExists(username):
        invalids.append("Username already exists")
        return invalids

    if displayNameExists(displayName):
        invalids.append("Display name already exists")
        return invalids
    
    # register user to the db
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "INSERT INTO users (display_name, username, password_hash, is_active, is_admin) VALUES (?, ?, ?, 1, 0)"
        cursor.execute(query, (displayName, username, generate_password_hash(password)))
        conn.commit()
    
    # add user profile pic path to the database
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "INSERT INTO profile_pics (user_id, filename) VALUES (?, NULL)"
        cursor.execute(query, (getUserId(username),))
        conn.commit()
    
    # create user-specific inventory folder
    user_id = getUserId(username)
    user_folder = os.path.join("static", "inventory-pics", f"user-{user_id}")
    os.makedirs(user_folder, exist_ok=True)
        
    return invalids
    
def usernameExists(username):
    """"Check if the provided username already exists in the database"""
    # get the list of usernames
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT COUNT(*) FROM users WHERE username = ?"
        cursor.execute(query, (username, ))
        result = cursor.fetchone()
    
    return result[0] > 0

def loginUser(username, password):
    """Determine where to provide a session id to the user"""
    if not validateUsername(username) or not validatePassword(password):
        return False
    
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT password_hash FROM users WHERE username = ?"
        result = cursor.execute(query, (username,)).fetchone()
        
    if result is None:
        return False  # Username doesn't exist

    passwordHash = result[0]
    return check_password_hash(passwordHash, password)


def getUserId(username):
    """"Return id for the specified username"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT user_id from users WHERE username = ?"
        result = cursor.execute(query, (username,)).fetchone()
    
    return result[0]

def displayNameExists(displayName):
    """"Check if the provided display name already exists in the database"""
    # get the list of display names
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT COUNT(*) FROM users WHERE display_name = ?"
        cursor.execute(query, (displayName, ))
        result = cursor.fetchone()
    
    return result[0] > 0

def validateUsername(username):
    """Check if the username is valid"""
    minLength = 12
    pattern = re.compile(r'^[A-Za-z0-9]+$')
    
    if not pattern.match(username):
        return False
    
    if len(username) < minLength:
        return False
    
    return True

def validatePassword(password):
    """Check if the password is valid"""
    invalids = []
    minLength = 12
    
    if len(password) < minLength:
        return False
    
    if not re.search(r'[A-Z]', password):
        return False
    
    if not re.search(r'[a-z]', password):
        return False
    
    if not re.search(r'[0-9]', password):
        return False
    
    if re.search(r'[\W_]', password):
        return False
    
    return True

def getDisplayName(username):
    """Get the display name for the specified username"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT display_name FROM users WHERE username = ?"
        result = cursor.execute(query, (username,)).fetchone()
    
    return result[0]

def getProfilePic(username):
    """Get the profile pic path for the specified username"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT filename FROM profile_pics WHERE user_id = ?"
        result = cursor.execute(query, (getUserId(username),)).fetchone()
    
    return result[0]

def updateItemDetails(item_id, category, name, price, quantity, description, image_filenames):
    """Update the inventory of the user"""
    item_data = json.dumps({
        "category": category,
        "image_filenames": image_filenames,
        "name": name,
        "price": price,
        "quantity": quantity,
        "description": description
    })
    
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "UPDATE inventory SET item_data = ? WHERE item_id = ?"
        cursor.execute(query, (item_data, item_id))
        conn.commit()
        
def getUserInventory(user_id):
    """Fetch inventory data for a specific user"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT item_data FROM inventory WHERE user_id = ? and expired = 0"
        cursor.execute(query, (user_id,))
        result = cursor.fetchall()
    
    inventory_list = [json.loads(item[0]) for item in result]
    return inventory_list

def deleteFromInventory(item_id):
    """"Mark item as expired in the database"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "UPDATE inventory SET expired = 1 WHERE item_id = ?"
        cursor.execute(query, (item_id,))
        conn.commit()
        
def createFilenames(fileExtensions, item_Id):
    """Create a list of filenames for the new files"""
    filenames = []
    for ext in fileExtensions:
        filenames.append(f"{item_Id}-{uuid.uuid4()}.{ext}")
    
    return filenames

def newItemToInventory(user_id):
    """Insert a new user_id into the database and return the new item_id"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "INSERT INTO inventory (user_id, item_data, expired) VALUES (?, ?, 0)"
        cursor.execute(query, (user_id, "{}"))
        conn.commit()
    
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT item_id FROM inventory WHERE user_id = ? ORDER BY item_id DESC LIMIT 1"
        result = cursor.execute(query, (user_id,)).fetchone()
    
    return result[0]

def isImage(file):
    """Check if the file is an image"""
    try:
        with Image.open(file) as img:
            img.verify()
            file.seek(0)
            return True
    except Exception:
        return False
    
def isValidSize(file):
    """Check if the file size is within the allowed limit"""
    return file.content_length <= MAX_FILE_SIZE

def isValidExtension(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def getItemIds(user_id):
    """Get the list of item ids for the specified user"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT item_id FROM inventory WHERE user_id = ? and expired = 0"
        cursor.execute(query, (user_id,))
        result = cursor.fetchall()
    
    return [item[0] for item in result]

def getImageFilenames(item_id):
    """Get the list of image filenames for the specified item"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT item_data FROM inventory WHERE item_id= ?"
        result = cursor.execute(query, (item_id,)).fetchone()
    
    return json.loads(result[0])["image_filenames"]

def deleteFromFileSystem(image_filenames, user_id):
    """Delete image from the file system"""
    for filename in image_filenames:
        path = os.path.join("static", "inventory-pics", f"user-{user_id}", filename)
        os.remove(path)
        
def searchForUsers(search_query, user_id):
    """Search for users in the database"""
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "SELECT display_name FROM users WHERE LOWER(display_name) LIKE LOWER(?) AND user_id != ?"
        cursor.execute(query, (f'%{search_query}%', user_id))
        result = cursor.fetchall()
    
    return [user[0] for user in result]

def getPathToProfilePic(display_name):
    """Get path to profile pic for user with the display name"""
    DEFAULT_PROFILE_PIC_PATH = url_for('static', filename="profile-pics/default.png")
    
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query1 = "SELECT user_id FROM users WHERE display_name = ?"
        query2 = "SELECT filename FROM profile_pics WHERE user_id = ?"
        user_id = cursor.execute(query1, (display_name, )).fetchone()[0]
        filename = cursor.execute(query2, (user_id, )).fetchone()[0]
        
    if filename:
        return url_for("static", filename=f"profile-pics/user_{user_id}")
    return DEFAULT_PROFILE_PIC_PATH
    
