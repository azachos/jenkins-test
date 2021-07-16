def SLACK_CHANNEL = "#frontend-notification"
def SLACK_USER    = "Jenkins Deployment"
def SLACK_ICON    = ":jenkins_ci:"
def NAME          = "app-template"
def DEV_HOST      = "dev-frontend-r1-1.productsup.com"
def base_url      = "dev-frontend.productsup.com"
def APP_ENV
def package_version
def version
def branch_name
String gitCommitHash
String gitCommitAuthor
String gitCommitMessage

pipeline {
    agent { label 'jenkins-4'}
    options {
        buildDiscarder(
            logRotator(
                numToKeepStr: '5',
                artifactNumToKeepStr: '5'
            )
        )
        timestamps()
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
        skipDefaultCheckout()
    }

    stages {
        // Checkout code with tags. The regular scm call does a flat checkout
        // and we need the tags to set the version
        stage("Checkout") {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: env.BRANCH_NAME]],
                    extensions: [[$class: 'CloneOption', noTags: false, shallow: false, depth: 0, reference: '']],
                    userRemoteConfigs: scm.userRemoteConfigs,
                ])
            }
        }

        // set version with the following scheme
        //   tags:   version = <tag>
        //   PR:     version = <latest tag>.<PR number>
        //   branch: version = <latest tag>-<branch name>
        stage ('Getter informations') {
            steps {
                script {
                    sh 'printenv | sort'
                    TAG = sh(returnStdout: true, script: "git tag --sort version:refname | tail -1").trim()

                    if (!TAG?.trim()) {
                        TAG = '0'
                    }
                    gitCommitHash    = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    gitCommitAuthor  = sh(returnStdout: true, script: 'git show -s --pretty=%aN').trim()
                    gitCommitMessage = sh(returnStdout: true, script: 'git show -s --pretty=%s').trim()

                    sh "echo 'tag: ${TAG}'"
                    if ( env.TAG_NAME ) {
                        version = "${env.TAG_NAME.toLowerCase()}"
                        branch_name  = "${version}"
                    } else if ( env.BRANCH_NAME.startsWith('PR') ) {
                        version = "${TAG}-${env.CHANGE_BRANCH.toLowerCase()}"
                        branch_name  = "${env.CHANGE_BRANCH.toLowerCase()}"
                    } else {
                        version = "${TAG}-${env.BRANCH_NAME.toLowerCase()}"
                        branch_name  = "${env.BRANCH_NAME.toLowerCase()}"
                    }
                    sh "echo ${version}"
                }
            }
        }

        stage ('Set Env - Prods') {
            when {
                buildingTag()
            }
            steps {
                script {
                    APP_ENV = 'prod'
                    package_version = version
                }
            }
        }

        stage ('Set Env - Stage') {
            when {
                not {
                    buildingTag()
                }
            }
            steps {
                script {
                    APP_ENV = 'stage'
                    package_version = branch_name
                }
            }
        }

        stage ('Build Code') {
            steps {
                script {
                    docker.image('node').inside {
                        sh 'curl -fSL -o /usr/local/bin/phrase https://github.com/phrase/phrase-cli/releases/download/2.1.6/phrase_linux_amd64'
                        sh 'chmod +x /usr/local/bin/phrase'
                        withNPM(npmrcConfig:'npmrc') {
                            sh 'npm install'
                            sh "npm run build"
                        }
                    }
                }
            }
        }

        stage ('Tests') {
            steps {
                script {
                    docker.image('node').inside {
                        sh 'npm ci --verbose'
                    }
                }
            }
        }

        // build dev deb package when we're not building a tag.
        // we use different naming for the packages in dev and prod

        // build prod deb package when we build a tag.
        // we use different naming for the packages in dev and prod
        stage ('Build deb package') {
            steps {
                script {
                    // prepending the branch version to path so multiple branches can be deployed at the same time.

                    if( APP_ENV == 'stage' ) {
                        sh "sed -i 's/\\/home\\//\\/home\\/${branch_name}-/g' nfpm.yaml"
                        sh "sed -i 's/^name.*/name: \"${branch_name}_${NAME}\"/g' nfpm.yaml"
                    }
                    
                    sh 'cat nfpm.yaml'
                    sh "chown -R www-data:www-data ./dist"
                    sh "version=${version} nfpm pkg --target ${NAME}_${package_version}_all.deb"
                    sh "dpkg-deb -I ${NAME}_${package_version}_all.deb"
                    sh "dpkg -c ${NAME}_${package_version}_all.deb"
                }
            }
        }

        stage ('Deploy dev package') {
            when {
                not {
                    buildingTag()
                }
            }
            steps {
                script {
                    sshagent (credentials: ['jenkins-ssh']) {
                        script {
                            sh "scp -o StrictHostKeyChecking=no ${NAME}_${branch_name}_all.deb root@${DEV_HOST}:/tmp/"
                            sh "ssh -o StrictHostKeyChecking=no root@${DEV_HOST} \"dpkg -i /tmp/${NAME}_${branch_name}_all.deb\""
                            sh "ssh -o StrictHostKeyChecking=no root@${DEV_HOST} \"rm /tmp/${NAME}_${branch_name}_all.deb\""
                        }
                    }
                }
            }
        }

        stage ('Build prod deb package') {
            when {
                buildingTag()
            }
            steps {
                script {
                    sh "chown -R www-data:www-data ./dist"
                    sh "version=${version} nfpm pkg --target ${NAME}_${version}_all.deb"
                    sh "dpkg-deb -I ${NAME}_${version}_all.deb"
                    sh "dpkg -c ${NAME}_${version}_all.deb"
                }
            }
        }

        // If we are building a tag, publish the created package to our debian repository
        stage ('Publish deb package') {
            when {
                buildingTag()
            }
            steps {
                sshagent (credentials: ['jenkins-ssh']) {
                    script {
                        sh "scp -o StrictHostKeyChecking=no ${NAME}_${version}_all.deb root@aptly.productsup.com:/tmp/"
                        sh "ssh -o StrictHostKeyChecking=no root@aptly.productsup.com \"aptly repo add -remove-files -force-replace stable /tmp/${NAME}_${version}_all.deb && \
                        aptly publish update -force-overwrite -passphrase-file='/root/.aptly/passphrase' -batch stable s3:aptly-productsup:debian\""
                    }
                }
            }
        }
    }

    post ('Cleanup') {
        // failure sends a failure slack massege if the pipeline exit with a failed state
        failure {
            slackSend message: "${NAME} <${RUN_DISPLAY_URL}|failed>.", channel: "${SLACK_CHANNEL}", color: "danger"
        }
        // success sends a success slack massege if the pipeline exit with a success state
        success {
            slackSend message: "*${NAME} <${RUN_DISPLAY_URL}|success>*. \nAll checks passed for *${branch_name}* \nat commit *${gitCommitHash}* \nwhen *${gitCommitAuthor}* performed \n> ${gitCommitMessage}.", channel: "${SLACK_CHANNEL}", color: "good"
        }
        // cleanup always run last and will trigger for both success and failure states
        cleanup {
            cleanWs deleteDirs: true
        }
    }
}