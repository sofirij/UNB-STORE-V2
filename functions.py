import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash

def registerUsername(username, password):
    """"Register new user to the database"""
    if usernameExists(username):
        return False
    
    # register user to the db
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "INSERT INTO users (username, password_hash, is_active, is_admin) VALUES (?, ?, 1, 0)"
        cursor.execute(query, (username, generate_password_hash(password)))
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
    """Provide a session id to the user"""
    if not usernameExists(username):
        return False
    
    # get password for the username
    with sqlite3.connect("app.db") as conn:
        cursor = conn.cursor()
        query = "S"
        
        
    if not check_password_hash(passwordHash, password)