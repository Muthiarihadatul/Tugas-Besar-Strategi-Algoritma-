const cities = {
    A: { x: 400, y: 100 },
    B: { x: 200, y: 300 },
    C: { x: 600, y: 300 },
    D: { x: 200, y: 500 },
    E: { x: 600, y: 500 }
};

const distances = {
    A: { B: 3, C: 4, D: 5, E: 3 },
    B: { A: 3, C: 6, D: 6, E: 3 },
    C: { A: 4, B: 6, D: 3, E: 4 },
    D: { A: 5, B: 6, C: 3, E: 3 },
    E: { A: 3, B: 3, C: 4, D: 3 }
};

const tariffs = {
    A: { B: 3000, C: 4000, D: 5000, E: 3000 },
    B: { A: 3000, C: 6000, D: 6000, E: 3000 },
    C: { A: 4000, B: 6000, D: 3000, E: 4000 },
    D: { A: 5000, B: 6000, C: 3000, E: 3000 },
    E: { A: 3000, B: 3000, C: 4000, D: 3000 }
};

// Adjacency matrix
const adjacencyMatrix = {
    A: { B: true, C: true, D: true, E: true },
    B: { A: true, C: true, D: true, E: true },
    C: { A: true, B: true, D: true, E: true },
    D: { A: true, B: true, C: true, E: true },
    E: { A: true, B: true, C: true, D: true }
};

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    Object.keys(distances).forEach(city1 => {
        Object.keys(distances[city1]).forEach(city2 => {
            ctx.beginPath();
            ctx.moveTo(cities[city1].x, cities[city1].y);
            ctx.lineTo(cities[city2].x, cities[city2].y);
            ctx.stroke();
            const midX = (cities[city1].x + cities[city2].x) / 2;
            const midY = (cities[city1].y + cities[city2].y) / 2;
            ctx.fillText(${distances[city1][city2]} (${tariffs[city1][city2]}), midX, midY);
        });
    });

    // Draw nodes
    Object.keys(cities).forEach(city => {
        ctx.beginPath();
        ctx.arc(cities[city].x, cities[city].y, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.fillText(city, cities[city].x - 5, cities[city].y + 5);
    });
}

function findRoute() {
    const startCity = document.getElementById('startCity').value;
    const endCity = document.getElementById('endCity').value;
    const searchMethod = document.getElementById('searchMethod').value;
    const maxTarif = parseInt(document.getElementById('tarif').value, 10);

    let routes;
    if (searchMethod === 'greedy') {
        routes = [findGreedyRoute(startCity, endCity)];
    } else {
        routes = findBruteForceRoutes(startCity, endCity, maxTarif);
    }

    displayRoute(routes, maxTarif);
}

function findGreedyRoute(start, end) {
    let route = [];
    let totalTarif = 0;
    let visited = new Set();
    let currentNode = start;

    while (currentNode !== end) {
        route.push(currentNode);
        visited.add(currentNode);

        let nearestNeighbor = null;
        let shortestDistance = Infinity;
        let currentTariff = 0;

        // Check if there is a direct route to the end
        if (distances[currentNode][end] !== undefined) {
            nearestNeighbor = end;
            shortestDistance = distances[currentNode][end];
            currentTariff = tariffs[currentNode][end];
        } else {
            // Find the nearest neighbor among all neighbors
            for (let neighbor in distances[currentNode]) {
                if (!visited.has(neighbor) && distances[currentNode][neighbor] < shortestDistance) {
                    shortestDistance = distances[currentNode][neighbor];
                    nearestNeighbor = neighbor;
                    currentTariff = tariffs[currentNode][neighbor];
                }
            }
        }

        if (nearestNeighbor === null) {
            console.log("No path found!");
            return { route: [], totalTarif: 0 };
        }

        totalTarif += currentTariff;
        currentNode = nearestNeighbor;
    }

    route.push(end);
    return { route, totalTarif };
}


function findBruteForceRoutes(start, end, maxTarif) {
    const allRoutes = permute(Object.keys(cities));
    const validRoutes = [];
    allRoutes.forEach(route => {
        if (route[0] === start && route[route.length - 1] === end) {
            const totalTarif = calculateTotalTarif(route);
            if (totalTarif <= maxTarif) {
                validRoutes.push({ route, distance: calculateDistance(route), totalTarif });
            }
        }
    });
    return validRoutes;
}

function permute(arr) {
    if (arr.length <= 1) return [arr];
    const permutations = [];
    for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
        const remainingPerms = permute(remaining);
        remainingPerms.forEach(perm => {
            permutations.push([current, ...perm]);
        });
    }
    return permutations;
}

function calculateDistance(route) {
    let dist = 0;
    for (let i = 0; i < route.length - 1; i++) {
        dist += distances[route[i]][route[i + 1]];
    }
    return dist;
}

function calculateTotalTarif(route) {
    let totalTarif = 0;
    for (let i = 0; i < route.length - 1; i++) {
        totalTarif += tariffs[route[i]][route[i + 1]];
    }
    return totalTarif;
}

function displayRoute(routes, maxTarif) {
    drawGraph();
    if (!routes || routes.length === 0) {
        document.getElementById('result').textContent = No valid route found within the maximum tariff of ${maxTarif};
        return;
    }

    let resultText = Routes within the maximum tariff of ${maxTarif}:<br>;
    routes.forEach(({ route, distance, totalTarif }) => {
        ctx.strokeStyle = totalTarif <= maxTarif ? 'green' : 'red';
        for (let i = 0; i < route.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cities[route[i]].x, cities[route[i]].y);
            ctx.lineTo(cities[route[i + 1]].x, cities[route[i + 1]].y);
            ctx.stroke();
        }
        ctx.strokeStyle = 'black';
        resultText += Route: ${route.join(' -> ')} | Distance: ${distance} | Total Tarif: ${totalTarif}<br>;
    });

    document.getElementById('result').innerHTML = resultText;
}

window.onload = drawGraph;