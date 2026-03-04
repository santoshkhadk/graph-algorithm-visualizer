import math
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .algo import dijkstra, astar, bellman_ford

def sanitize(obj):
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize(x) for x in obj]
    elif isinstance(obj, float):
        if math.isinf(obj) or math.isnan(obj):
            return None
        return obj
    else:
        return obj

@api_view(['POST'])
def run_algorithm(request):
    data = request.data
    graph = data["graph"]   # graph = [[(neighbor, weight), ...], ...]
    start = data["start"]
    end = data["end"]
    algorithm = data["algorithm"]
    heuristic = data.get("heuristic", {})

    if algorithm == "dijkstra":
        steps, path = dijkstra(graph, start, end)
    elif algorithm == "astar":
        steps, path = astar(graph, start, end, heuristic)
    elif algorithm == "bellman-ford":
        steps, path = bellman_ford(graph, start, end)
    else:
        return Response({"error": "Invalid algorithm"})

    return Response({
        "steps": sanitize(steps),
        "path": sanitize(path)
    })