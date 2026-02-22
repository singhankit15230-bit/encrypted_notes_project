# API Testing Guide

This guide provides examples for testing all API endpoints using curl and Postman.

## Prerequisites
- Server running on http://localhost:5000
- curl installed (for command line testing)
- Postman installed (for GUI testing)

## Authentication Endpoints

### 1. Register New User

**curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login

**curl:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Get Current User

**curl:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Notes Endpoints

**Note:** Replace `YOUR_TOKEN_HERE` with your actual JWT token from login/register response.

### 4. Create Note (without file)

**curl:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Note",
    "content": "This is the content of my first secure note.",
    "isPinned": false
  }'
```

### 5. Create Note (with encrypted file)

**curl:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=Note with File" \
  -F "content=This note has an encrypted file attachment" \
  -F "isPinned=false" \
  -F "file=@/path/to/your/file.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Note created successfully",
  "note": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Note with File",
    "content": "This note has an encrypted file attachment",
    "user": "64a1b2c3d4e5f6g7h8i9j0k1",
    "file": {
      "fileName": "file-1234567890.pdf",
      "originalName": "file.pdf",
      "mimeType": "application/pdf",
      "size": 102400
    },
    "isPinned": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Get All Notes

**curl:**
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "notes": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Note with File",
      "content": "This note has an encrypted file attachment",
      "user": "64a1b2c3d4e5f6g7h8i9j0k1",
      "file": {
        "fileName": "file-1234567890.pdf",
        "originalName": "file.pdf",
        "mimeType": "application/pdf",
        "size": 102400
      },
      "isPinned": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "title": "My First Note",
      "content": "This is the content of my first secure note.",
      "user": "64a1b2c3d4e5f6g7h8i9j0k1",
      "isPinned": false,
      "createdAt": "2024-01-01T00:01:00.000Z",
      "updatedAt": "2024-01-01T00:01:00.000Z"
    }
  ]
}
```

### 7. Get Single Note

**curl:**
```bash
curl -X GET http://localhost:5000/api/notes/64a1b2c3d4e5f6g7h8i9j0k2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Update Note

**curl:**
```bash
curl -X PUT http://localhost:5000/api/notes/64a1b2c3d4e5f6g7h8i9j0k2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Note Title",
    "content": "Updated content here",
    "isPinned": true
  }'
```

### 9. Update Note with New File

**curl:**
```bash
curl -X PUT http://localhost:5000/api/notes/64a1b2c3d4e5f6g7h8i9j0k2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=Updated Note with New File" \
  -F "content=Updated content with new encrypted file" \
  -F "isPinned=true" \
  -F "file=@/path/to/new/file.pdf"
```

### 10. Download Encrypted File

**curl:**
```bash
curl -X GET http://localhost:5000/api/notes/64a1b2c3d4e5f6g7h8i9j0k2/file \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o downloaded-file.pdf
```

### 11. Delete File from Note

**curl:**
```bash
curl -X DELETE http://localhost:5000/api/notes/64a1b2c3d4e5f6g7h8i9j0k2/file \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### 12. Delete Note

**curl:**
```bash
curl -X DELETE http://localhost:5000/api/notes/64a1b2c3d4e5f6g7h8i9j0k2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

## Postman Collection

### Import Collection

1. Open Postman
2. Click "Import"
3. Paste the JSON below
4. Set `{{baseUrl}}` variable to `http://localhost:5000/api`
5. Set `{{token}}` variable after login

### Collection JSON

```json
{
  "info": {
    "name": "Secure Notes API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Get Me",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/me",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "me"]
            }
          }
        }
      ]
    },
    {
      "name": "Notes",
      "item": [
        {
          "name": "Get All Notes",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/notes",
              "host": ["{{baseUrl}}"],
              "path": ["notes"]
            }
          }
        },
        {
          "name": "Create Note",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "title",
                  "value": "Test Note",
                  "type": "text"
                },
                {
                  "key": "content",
                  "value": "This is a test note",
                  "type": "text"
                },
                {
                  "key": "isPinned",
                  "value": "false",
                  "type": "text"
                },
                {
                  "key": "file",
                  "type": "file",
                  "src": []
                }
              ]
            },
            "url": {
              "raw": "{{baseUrl}}/notes",
              "host": ["{{baseUrl}}"],
              "path": ["notes"]
            }
          }
        },
        {
          "name": "Get Single Note",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/notes/:id",
              "host": ["{{baseUrl}}"],
              "path": ["notes", ":id"]
            }
          }
        },
        {
          "name": "Update Note",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "title",
                  "value": "Updated Title",
                  "type": "text"
                },
                {
                  "key": "content",
                  "value": "Updated content",
                  "type": "text"
                },
                {
                  "key": "isPinned",
                  "value": "true",
                  "type": "text"
                }
              ]
            },
            "url": {
              "raw": "{{baseUrl}}/notes/:id",
              "host": ["{{baseUrl}}"],
              "path": ["notes", ":id"]
            }
          }
        },
        {
          "name": "Delete Note",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/notes/:id",
              "host": ["{{baseUrl}}"],
              "path": ["notes", ":id"]
            }
          }
        },
        {
          "name": "Download File",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/notes/:id/file",
              "host": ["{{baseUrl}}"],
              "path": ["notes", ":id", "file"]
            }
          }
        },
        {
          "name": "Delete File",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/notes/:id/file",
              "host": ["{{baseUrl}}"],
              "path": ["notes", ":id", "file"]
            }
          }
        }
      ]
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this note"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Note not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

## Testing Workflow

1. **Register** a new user
2. Save the returned **token**
3. Use token in Authorization header for all subsequent requests
4. **Create notes** with and without files
5. **List all notes**
6. **Update notes**
7. **Download encrypted files**
8. **Delete notes**

## Tips

- Always include `Authorization: Bearer <token>` header for protected routes
- Use `multipart/form-data` for file uploads
- Use `application/json` for JSON payloads
- File downloads return binary data with appropriate Content-Type
- Maximum file size is 10MB by default

---

**Happy Testing! 🚀**
