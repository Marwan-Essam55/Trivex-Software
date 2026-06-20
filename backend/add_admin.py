import sqlite3, uuid
from passlib.context import CryptContext

# تشفير الباسورد "123456"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_pw = pwd_context.hash("123456")

# الاتصال بالداتا بيز
conn = sqlite3.connect('trivex.db')
cursor = conn.cursor()

# زرع بيانات الأدمن
cursor.execute("""
    INSERT INTO users (id, email, hashed_password, first_name, last_name, is_active, role, available_credits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", (str(uuid.uuid4()), 'admin@admin.com', hashed_pw, 'System', 'Admin', 1, 'ADMIN', 5))

conn.commit()
conn.close()
print("✅ Admin added successfully! You can log in now.")