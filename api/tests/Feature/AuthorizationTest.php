<?php

test('protected endpoints reject unauthenticated requests', function (string $method, string $uri) {
    $this->json($method, $uri)->assertUnauthorized();
})->with([
    ['GET', '/api/user'],
    ['GET', '/api/categories'],
    ['POST', '/api/categories'],
    ['GET', '/api/vendors'],
    ['POST', '/api/vendors'],
    ['GET', '/api/cards'],
    ['POST', '/api/cards'],
    ['GET', '/api/expenses?year=2026&month=8'],
    ['POST', '/api/expenses'],
    ['GET', '/api/allowance'],
    ['PUT', '/api/allowance'],
    ['GET', '/api/card-bills?year=2026&month=8'],
    ['PUT', '/api/card-bills'],
    ['GET', '/api/months/2026/8/summary'],
    ['POST', '/api/months/2026/8/close'],
]);
