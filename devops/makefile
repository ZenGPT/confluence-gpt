deploy-stag:
	ansible-playbook playbook-ace.yml --inventory env_vars/stag/hosts.yaml --extra-vars "ansible_ssh_private_key_file=" --extra-vars=@.local.stag.json

deploy-stag-db:
	ansible-playbook playbook-postgresql.yml --inventory env_vars/stag/hosts.yaml --extra-vars "ansible_ssh_private_key_file=" --extra-vars=@.local.stag.json

