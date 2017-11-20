# jekyll-webpack

> Jekyll & Webpack project

# 🚧 You must have ruby installed on your development machine, please have a look at this [installation guide](https://www.youtube.com/watch?v=jQo8IQtLueU), I recommend at least ruby v2.3.3. Set the remote origin to the master branch of your GitHub repo (run `git remote -v` to verify).

## Build Setup

``` bash
# jekyll directory

    # install the jekyll version compatible with gh-pages
    $ gem install bundler && bundle install

# root directory of the project

    # install npm dependencies 
    $ npm install

    # build for development, site will run at localhost:8080
    $ npm run dev

    # build for production
    $ npm run build

    # pre-deployment (commit & push to github on master branch)
    $ git add .
    $ git commit -m"message goes here"
    $ git push

    # deployment (push to github on gh-pages branch)
    $ npm run deploy
```
Then visit your gh-pages url and view the site!
