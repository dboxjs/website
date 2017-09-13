develop: docker-compose.yml
	docker-compose up -d --build --force-recreate --remove-orphans
stop:
	docker-compose stop
