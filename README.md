# RED_TETRIS

# STEPS TO GET UP AND RUNNING
*npm install from client and server directories

*enter node_modules in client directory and enter react_scripts directory

inside react_scripts directory enter config directory

open paths.js and edit appHtml on line 87 to = appHtml: resolveApp('index.html'), appIndexJs on line 88 to = appIndexJs: resolveModule(resolveApp, 'index'), and appSrc on line 90 to = appSrc: resolveApp(''),

Everything should run fine after that..