from fastapi import APIRouter, Body
from g4f.client import Client
import g4f
import g4f.Provider
import sys
import os
from app.utils import get_query_response

router = APIRouter(
    prefix="/chatbot",         # optional: adds /users to all routes
    tags=["chatbot"]           # optional: groups routes in docs
)

@router.post("/")
def chat(query : str = Body(...,embed=True)):
    
    result = get_query_response(query)
    return {"response": result}