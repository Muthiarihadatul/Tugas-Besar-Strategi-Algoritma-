const cities = {
    Bandung: { x: 400, y: 100 },
    Jakarta: { x: 200, y: 300 },
    Cirebon: { x: 600, y: 300 },
    Solo: { x: 200, y: 500 },
    Jogja: { x: 600, y: 500 }
};

const distances = {
    Bandung: { Jakarta: 3, Cirebon: 4, Solo: 5, Jogja: 3 },
    Jakarta: { Bandung: 3, Cirebon: 6, Solo: 6, Jogja: 3 },
    Cirebon: { Bandung: 4, Jakarta: 6, Solo: 3, Jogja: 4 },
    Solo: { Bandung: 5, Jakarta: 6, Cirebon: 3, Jogja: 3 },
    Jogja: { Bandung: 3, Jakarta: 3, Cirebon: 4, Solo: 3 }
};

const tariffs = {
    Bandung: { Jakarta: 3000, Cirebon: 4000, Solo: 5000, Jogja: 3000 },
    Jakarta: { Bandung: 3000, Cirebon: 6000, Solo: 6000, Jogja: 3000 },
    Cirebon: { Bandung: 4000, Jakarta: 6000, Solo: 3000, Jogja: 4000 },
    Solo: { Bandung: 5000, Jakarta: 6000, Cirebon: 3000, Jogja: 3000 },
    Jogja: { Bandung: 3000, Jakarta: 3000, Cirebon: 4000, Solo: 3000 }
};

// Adjacency matrix
const adjacencyMatrix = {
    Bandung: { Jakarta: true, Cirebon: true, Solo: true, Jogja: true },
    Jakarta: { Bandung: true, Cirebon: true, Solo: true, Jogja: true },
    Cirebon: { Bandung: true, Jakarta: true, Solo: true, Jogja: true },
    Solo: { Bandung: true, Jakarta: true, Cirebon: true, Jogja: true },
    Jogja: { Bandung: true, Jakarta: true, Cirebon: true, Solo: true }
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
            ctx.fillText(`${distances[city1][city2]} (${tariffs[city1][city2]})`, midX, midY);
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
        routes = findBacktrackingRoutes(startCity, endCity, maxTarif);
    }

    displayRoute(routes, maxTarif);
}

function findGreedyRoute(start, end) {
    let route = [];
    let totalTarif = 0;
    let distance = 0; // Variable to store total distance
    let visited = new Set();
    let currentNode = start;

    while (currentNode !== end) {
        route.push(currentNode);
        visited.add(currentNode);

        let nearestNeighbor = null;
        let shortestDistance = Infinity;
        let currentTariff = 0;

        // Check if there is a direct route to the end
        if (distances[currentNode][end] !== undefined && !visited.has(end)) {
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
            return { route: [], totalTarif: 0, totalDistance: 0 };
        }

        totalTarif += currentTariff;
        distance += shortestDistance; // Accumulate the shortest distance
        currentNode = nearestNeighbor;

        // If a direct route to the end city was found, update the route and break the loop
        if (currentNode === end) {
            route.push(end);
            break;
        }
    }

    return { route, distance, totalTarif }; // Return total distance along with route and total tariff
}




function findBacktrackingRoutes(start, end, maxTarif) {
    const allRoutes = [];
    let currentRoute = [start];
    const shortestRoute = [];
    let shortestDistance = Infinity;
    let shortestTarif = Infinity;

    // Start backtracking
    backtracking(start, end, maxTarif, currentRoute, allRoutes, shortestRoute, shortestDistance, shortestTarif);

    return allRoutes;
}

function backtracking(currentCity, end, maxTarif, currentRoute, allRoutes, shortestRoute, shortestDistance, shortestTarif) {
    if (currentCity === end) {
        const currentDistance = calculateDistance(currentRoute);
        const currentTarif = calculateTotalTarif(currentRoute);

        if (currentTarif <= maxTarif) {
            allRoutes.push({ route: currentRoute.slice(), distance: currentDistance, totalTarif: currentTarif });
            if (currentDistance < shortestDistance) {
                shortestRoute.splice(0);
                currentRoute.forEach(city => shortestRoute.push(city));
                shortestDistance = currentDistance;
                shortestTarif = currentTarif;
            }
        }
        return;
    }

    for (let neighbor in adjacencyMatrix[currentCity]) {
        if (!currentRoute.includes(neighbor)) {
            const potentialTarif = tariffs[currentCity][neighbor];
            const potentialRoute = currentRoute.concat([neighbor]);

            if (calculateTotalTarif(potentialRoute) <= maxTarif) {
                backtracking(neighbor, end, maxTarif, potentialRoute, allRoutes, shortestRoute, shortestDistance, shortestTarif);
            }
        }
    }
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

const routeColors = ['green', 'blue', 'orange', 'purple', 'brown']; // Warna yang berbeda untuk setiap rute

function displayRoute(routes, maxTarif) {
    drawGraph();
    if (!routes || routes.length === 0) {
        document.getElementById('result').textContent = `No valid route found within the maximum tariff of ${maxTarif}`;
        return;
    }

    let resultText = `Routes within the maximum tariff of ${maxTarif}:<br>`;
    routes.forEach((routeData, index) => {
        const { route, distance, totalTarif } = routeData;
        const color = totalTarif <= maxTarif ? routeColors[index % routeColors.length] : 'red'; // Pilih warna dari array berdasarkan indeks rute

        const routeText = `Route ${index + 1}: ${route.join(' -> ')} | Distance: ${distance} | Total Tarif: ${totalTarif}`;

        resultText += `<span style="color: ${color};">${routeText}</span><br>`;

        // Draw route
        ctx.strokeStyle = color;
        for (let i = 0; i < route.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cities[route[i]].x, cities[route[i]].y);
            ctx.lineTo(cities[route[i + 1]].x, cities[route[i + 1]].y);
            ctx.stroke();
        }
        ctx.strokeStyle = 'black';
    });

    document.getElementById('result').innerHTML = resultText;
}


window.onload = drawGraph;
