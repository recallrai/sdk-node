.PHONY: bump-patch bump-minor bump-major

bump-patch:
	bump2version patch
	git push && git push --tags

bump-minor:
	bump2version minor
	git push && git push --tags

bump-major:
	bump2version major
	git push && git push --tags
