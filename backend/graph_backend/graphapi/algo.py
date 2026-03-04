import heapq

# -------------------------
# DIJKSTRA
# -------------------------
def dijkstra(graph, start, end):
    steps = []
    pq = [(0, start)]
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    visited = set()
    parent = {}

    while pq:
        dist, node = heapq.heappop(pq)
        if node in visited:
            continue

        visited.add(node)

        steps.append({
            "current": node,
            "visited": list(visited),
            "distances": distances.copy()
        })

        if node == end:
            break

        for neighbor, weight in graph[node].items():
            new_dist = dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                parent[neighbor] = node
                heapq.heappush(pq, (new_dist, neighbor))

    path = reconstruct_path(parent, start, end)
    return steps, path


# -------------------------
# A* SEARCH
# -------------------------
def astar(graph, start, end, heuristic):
    steps = []
    pq = [(0, start)]
    g_score = {node: float('inf') for node in graph}
    g_score[start] = 0
    parent = {}
    visited = set()

    while pq:
        _, node = heapq.heappop(pq)

        visited.add(node)

        steps.append({
            "current": node,
            "visited": list(visited),
            "g_score": g_score.copy()
        })

        if node == end:
            break

        for neighbor, weight in graph[node].items():
            temp_g = g_score[node] + weight
            if temp_g < g_score[neighbor]:
                parent[neighbor] = node
                g_score[neighbor] = temp_g
                f_score = temp_g + heuristic.get(neighbor, 0)
                heapq.heappush(pq, (f_score, neighbor))

    path = reconstruct_path(parent, start, end)
    return steps, path


# -------------------------
# BELLMAN FORD
# -------------------------
def bellman_ford(graph, start, end):
    steps = []
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    parent = {}

    nodes = list(graph.keys())

    for _ in range(len(nodes) - 1):
        for u in graph:
            for v, w in graph[u].items():
                if distances[u] + w < distances[v]:
                    distances[v] = distances[u] + w
                    parent[v] = u

        steps.append({
            "distances": distances.copy()
        })

    path = reconstruct_path(parent, start, end)
    return steps, path


def reconstruct_path(parent, start, end):
    path = []
    node = end
    while node in parent:
        path.append(node)
        node = parent[node]
    path.append(start)
    return path[::-1]