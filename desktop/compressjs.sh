rm all-js-min.js
rm ../alvand/css/alvand-min.css
rm css/desktop-min.css

yuicompress -o all-js-min.js \
../FisheyeMenu/scripts/FisheyeMenu.js \
../FisheyeMenu/scripts/FisheyeMenuExtention.js \
../alvand/ux/CheckColumn.js \
../alvand/ux/uxmediapak.js \
js/StartMenu.js js/TaskBar.js \
js/Desktop.js \
js/App.js js/Module.js \
../alvand/WizardItinary.js \
../alvand/HistoryDispatch.js \
../alvand/UserTokenTableStores.js \
../alvand/communicator.js \
../alvand/stringbuffer.js \
../alvand/iframe.js \
../alvand/help-panel.js \
../alvand/basetoken-form.js \
../alvand/login-combo.js \
../alvand/tokenmask-combo.js \
../alvand/tokentable-combo.js \
../alvand/DeletableRowSelectionModel.js \
../alvand/dblogin-grid.js \
../alvand/createtokentable-form.js \
../alvand/tokentables-grid.js \
../alvand/createtoken-grid.js \
../alvand/resultstoken-grid.js \
../alvand/tokenresult-window.js \
../alvand/quicktestsummary-grid.js \
../alvand/quicktestresult-form.js \
../alvand/quicktestresult-window.js \
../alvand/quicktest-form.js \
../alvand/createtoken-form.js \
../alvand/redeemtoken-form.js \
../alvand/deletetoken-form.js \
TokenManagementApp.js \
desktop.js \
logviewer-grid.js \
extjs-log-viewer.js \

yuicompress -o login-min.js \
login.js \

yuicompress -o ../alvand/css/alvand-min.css \
../FisheyeMenu/styles/FisheyeMenu.css \
../alvand/css/alvand.css \

yuicompress -o css/desktop-min.css css/desktop.css \
