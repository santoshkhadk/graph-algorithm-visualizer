from rest_framework.decorators import api_view
from rest_framework.response import Response
from .algo import dijkstra, astar, bellman_ford
import math

def sanitize(obj):
    """
    Recursively replace inf/-inf with None
    """
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize(x) for x in obj]
    elif isinstance(obj, float):
        if math.isinf(obj) or math.isnan(obj):
            return None  # or a large number like 1e9
        
        return obj
    else:
        return obj

@api_view(['POST'])
def run_algorithm(request):
    data = request.data
    graph = data["graph"]
    start = data["start"]
    end = data["end"]
    algorithm = data["algorithm"]

    if algorithm == "dijkstra":
        steps, path = dijkstra(graph, start, end)

    elif algorithm == "astar":
        heuristic = data.get("heuristic", {})
        steps, path = astar(graph, start, end, heuristic)

    elif algorithm == "bellman-ford":
        steps, path = bellman_ford(graph, start, end)

    else:
        return Response({"error": "Invalid algorithm"})

    # Sanitize output to avoid JSON errors
    steps = sanitize(steps)
    path = sanitize(path)

    return Response({
        "steps": steps,
        "path": path
    })