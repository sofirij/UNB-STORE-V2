import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash
from flask import url_for

def registerUsername(username, password, displayName):
    """"Register new user to the database"""
    if usernameExists(username):
        return False

    if displayNameExists(displayName):
        return False
    
    # register user to the db
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "INSERT INTO users (display_name, username, password_hash, is_active, is_admin) VALUES (?, ?, ?, 1, 0)"
        cursor.execute(query, (displayName, username, generate_password_hash(password)))
        conn.commit()
    
    # add user profile pic path to the database
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "INSERT INTO profile_pics (user_id, path) VALUES (?, ?)"
        cursor.execute(query, (getUserId(username), url_for('static', filename='profile-pics/default.png')))
        conn.commit()
        
    return True
    
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