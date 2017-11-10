# jekyll-webpack

> Jekyll & Webpack project

## 🚧 You must have ruby installed on your development machine, please read the [installation guide](https://jekyllrb.com/docs/installation/). I show you how to install the correct version of Jekyll below. Also, my assumption is that you have set the remote origin to the master branch of your GitHub repo (run `git remote -v` to verify).

## Build Setup

``` bash
# jekyll directory

    # install the jekyll version compatible with gh-pages
    $ gem install bundler && bundle install

# root directory of the project

    # install npm dependencies 
    $ npm install

    # serve with hot reload at localhost:8080
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
Then visit your gh-pages url and enjoy!
