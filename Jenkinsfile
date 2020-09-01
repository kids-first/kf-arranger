@Library(value="kids-first/aws-infra-jenkins-shared-libraries", changelog=false) _
ecs_service_type_1_standard {
    projectName = "kf-arranger"
    environments = "dev,qa,prd"
    docker_image_type = "debian"
    internal_app = "false"
    entrypoint_command = "pm2-runtime index.js" 
    deploy_scripts_version = "master"
    quick_deploy = "true"
    external_config_repo = "false"
    container_port = "443"
    vcpu_container             = "2048"
    memory_container           = "4096"
    vcpu_task                  = "2048"
    memory_task                = "4096"
    health_check_path = "/status"
    additional_ssl_cert_domain_name = "*.kidsfirstdrc.org"
    dependencies = "ecr"
}
