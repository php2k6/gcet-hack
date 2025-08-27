from g4f.client import Client
import g4f
import g4f.Provider
import sys
import os

def get_query_response(query):
    client = Client()
    test_model = "gpt-4o"
    test_prompt = query
    base_dir = os.path.dirname(__file__)  # this will be 'app/' directory
    prompt_path = os.path.join(base_dir, "system_prompt.txt")
    with open(prompt_path, "r", encoding="utf-8") as f:
        system_msg = f.read()
    test_provider = g4f.Provider.PollinationsAI
    response = client.chat.completions.create(
        model=test_model,
        messages=[{ "role":"system", "content" : system_msg},{"role": "user", "content": test_prompt}],
        web_search=False,
        provider=test_provider
    )
    return response.choices[0].message.content