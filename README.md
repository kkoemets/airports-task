# Task

The test task consists of two parts, the main part, and a bonus part. We suggest tackling the bonus part once the main
objective of the service has been achieved. The task is to build a JSON over HTTP API endpoint that takes as input two
IATA/ICAO airport codes and provides as output a route between these two airports so that:

The route consists of at most 4 legs/flights (that is, 3 stops/layovers, if going from A->B, a valid route could be A->
1->2->3->B, or for example A->1->B etc.) and;

The route is the shortest such route as measured in kilometers of geographical distance.

For the bonus part, extend your service so that it also allows changing airports during stops that are within 100km of
each other. For example, if going from A->B, a valid route could be A->1->2=>3->4->B, where “2=>3” is a change of
airports done via ground. These switches are not considered as part of the legs/layover/hop count, but their distance
should be reflected in the final distance calculated for the route.

Notes:

The weekdays and flight times are not important for the purposes of the test task - you are free to assume that all
flights can depart at any required time

You are free to choose any publicly available airport and flight/route database

You are free to choose to use any open-source libraries

You are free to choose any programming language (TypeScript/Node is preferred, but not mandatory)

You can ask additional questionsThe test task consists of two parts, the main part, and a bonus part. We suggest
tackling the bonus part once the main objective of the service has been achieved.

# Solution explanation

To run tests: `npm run-script test`
To run app in dev mode: `npm run-script run-app-dev`

App API:
http://localhost:8080/api/airports/iata/routes/shortest?from=&to=

http://localhost:8080/api/airports/icao/routes/shortest?from=&to=

Example:
http://localhost:8080/api/airports/iata/routes/shortest?from=TLL&to=LHR

http://localhost:8080/api/airports/icao/routes/shortest?from=EETN&to=EGLL

Bonus part is not implemented but can be done with the current solution (e.g. in 100km radius airports added as a new field to Airport.