pipeline {
    agent any

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
                    sh 'docker build -t rural-gest-front:latest .'
                }
            }
        }
    }
}