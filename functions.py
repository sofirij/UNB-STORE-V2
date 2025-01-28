import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash
from flask import url_for
import re

def registerUsername(username, password, displayName):
    """"Register new user to the database"""
    invalids = []
    if not validateUsername(username) or not validatePassword(password):
        invalids.append("Invalid username or password")
    
    if usernameExists(username):
        invalids.append("Username already exists")

    if displayNameExists(displayName):
        invalids.append("Display name already exists")
    
    # register user to the db
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "INSERT INTO users (display_name, username, password_hash, is_active, is_admin) VALUES (?, ?, ?, 1, 0)"
        cursor.execute(query, (displayName, username, generate_password_hash(password)))
        conn.commit()
    
    # add user profile pic path to the database
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "INSERT INTO profile_pics (user_id, filename) VALUES (?, 'default')"
        cursor.execute(query, (getUserId(username),))
        conn.commit()
        
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