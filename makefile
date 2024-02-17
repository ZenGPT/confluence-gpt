build:
	make checks
	npm run build

install:
	make checks
	npm i

nvm:
	. ${NVM_DIR}/nvm.sh && nvm use && $(CMD)

checks:
	make nvm CMD="nvm use v16.18.1"
	make nvm CMD="node --version"
	docker --version
	docker-compose version

pg:
	cd devops/ && docker-compose up

clean:
	cd devops/ && docker-compose down

deploy-stag:
	cd devops/
	ansible-playbook playbook-ace.yml --inventory env_vars/stag/hosts.yaml --extra-vars "ansible_ssh_private_key_file=" --extra-vars=@devops/.local.stag.json

deploy-stag-db:
	cd devops/
	ansible-playbook playbook-postgresql.yml --inventory env_vars/stag/hosts.yaml --extra-vars "ansible_ssh_private_key_file=" --extra-vars=@.local.stag.json
