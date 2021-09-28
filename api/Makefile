.PHONY: build-getAllTrainingPlans \
	build-createNewPlan \
	build-getTrainingPlan \
	build-updateTrainingPlan \
	build-deleteTrainingPlan \
	build-getAllTrainingActivities \
	build-createNewActivity \
	build-getTrainingPlanActivity \
	build-updateTrainingPlanActivity \
	build-deleteTrainingPlanActivity \
	build-optionsHandler \
	build-RuntimeDependenciesLayer

build-getAllTrainingPlans:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-createNewPlan:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-getTrainingPlan:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-updateTrainingPlan:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-deleteTrainingPlan:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-getAllTrainingActivities:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-createNewActivity:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-getTrainingPlanActivity:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-updateTrainingPlanActivity:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-deleteTrainingPlanActivity:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-optionsHandler:
	npm install
	npm run build
	cp -r dist "$(ARTIFACTS_DIR)/"

build-RuntimeDependenciesLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
	rm "$(ARTIFACTS_DIR)/nodejs/package.json" # to avoid rebuilding when changes don't relate to dependencies 