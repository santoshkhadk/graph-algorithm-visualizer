import math
from queue import PriorityQueue

def dijkstra(graph, start, end):
    n = len(graph)
    dist = [math.inf] * n
    prev = [None] * n
    dist[start] = 0
    steps = []

    pq = PriorityQueue()
    pq.put((0, start))

    while not pq.empty():
        d, u = pq.get()
        steps.append({"current": u, "distances": dist.copy()})
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                prev[v] = u
                pq.put((dist[v], v))

    # build path
    path = []
    u = end
    while u is not None:
        path.append(u)
        u = prev[u]
    path.reverse()

    return steps, path

# A* (uses Manhattan heuristic)
def astar(graph, start, end, heuristic):
    n = len(graph)
    open_set = PriorityQueue()
    g_score = [math.inf] * n
    f_score = [math.inf] * n
    prev = [None] * n

    g_score[start] = 0
    f_score[start] = heuristic.get(start, 0)
    open_set.put((f_score[start], start))
    steps = []

    while not open_set.empty():
        _, u = open_set.get()
        steps.append({"current": u, "f_score": f_score.copy()})
        if u == end:
            break
        for v, w in graph[u]:
            tentative_g = g_score[u] + w
            if tentative_g < g_score[v]:
                g_score[v] = tentative_g
                f_score[v] = tentative_g + heuristic.get(v, 0)
                prev[v] = u
                open_set.put((f_score[v], v))

    # build path
    path = []
    u = end
    while u is not None:
        path.append(u)
        u = prev[u]
    path.reverse()
    return steps, path

def bellman_ford(graph, start, end):
    n = len(graph)
    dist = [math.inf] * n
    prev = [None] * n
    dist[start] = 0
    steps = []

    for _ in range(n - 1):
        updated = False
        for u in range(n):
            for v, w in graph[u]:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    prev[v] = u
                    updated = True
        steps.append({"distances": dist.copy()})
        if not updated:
            break

    # build path
    path = []
    u = end
    while u is not None:
        path.append(u)
        u = prev[u]
    path.reverse()

    return steps, path