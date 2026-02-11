pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "rural-gest-front"
        DOCKER_CREDS_ID = "dockerhub-credentials"
    }

    stages {
        stage('Install Dependencies') {
            agent {
                docker { 
                    image 'node:20.2.0-alpine3.17' 
                    reuseNode true
                }
            }
            steps {
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Constrói a imagem usando o Dockerfile do Front
                    sh 'docker build -t ${DOCKER_IMAGE}:latest .'
                }
            }
        }

        stage("Deploy to Docker Hub") {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", 
                         passwordVariable: 'DOCKER_HUB_PASSWORD', 
                         usernameVariable: 'DOCKER_HUB_USER')]) {
                            script {
                                // 1. Tagging: O Docker Hub exige o formato usuario/repositorio:tag
                                sh "docker tag rural-gest-front:latest ${DOCKER_HUB_USER}/ruralgest-front:latest"

                                // 2. Login
                                sh "echo ${DOCKER_HUB_PASSWORD} | docker login -u ${DOCKER_HUB_USER} --password-stdin"

                                // 3. Push
                                sh "docker push ${DOCKER_HUB_USER}/ruralgest-front:latest"

                                // 4. Logout (Opcional)
                                sh "docker logout"
                            }
                         }
            }
        }
    }
}