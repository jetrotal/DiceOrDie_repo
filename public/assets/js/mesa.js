// Classe específica para o formulário de mesa, herdando da BaseForm
class MesaForm extends BaseForm {
    constructor() {
        // Use centralized configuration instead of hardcoded values
        const config = FormConstants.getFormConfig('mesa');
        super('mainForm', config);

        // Inicializar componente de upload de imagem
        this.imageUpload = new ImageUploadMixin({
            purpose: 'campaign'
        });

        this.setupMesaSpecificElements();
        this.initMesaFeatures();
    }

    setupMesaSpecificElements() {
        this.publicoToggle = document.getElementById('publico');
        this.publicoLabel = document.getElementById('publicoLabel');
        this.autorField = document.getElementById('autor');
    }

    initMesaFeatures() {
        this.setupToggle();
        this.setDefaultAuthor();
    }

    setupModeIntegration() {
        // Usar implementação padronizada da classe pai
        super.setupModeIntegration();
    }

    setupToggle() {
        if (this.publicoToggle && this.publicoLabel) {
            this.publicoToggle.addEventListener('change', () => {
                this.publicoLabel.textContent = this.publicoToggle.checked ? 'Sim' : 'Não';
            });
        }
    }

    setDefaultAuthor() {
        if (this.autorField) {
            // Simular usuário logado - em um sistema real, isso viria do backend
            this.autorField.value = 'Usuário Atual'; // Placeholder
        }
    }

    getRequiredFields() {
        return ['nomeMesa', 'sistema', 'qtdJogadores', 'autor', 'descricao'];
    }

    getFormData() {
        return {
            nomeMesa: document.getElementById('nomeMesa')?.value.trim(),
            sistema: document.getElementById('sistema')?.value,
            qtdJogadores: parseInt(document.getElementById('qtdJogadores')?.value) || 0,
            autor: document.getElementById('autor')?.value.trim(),
            publico: document.getElementById('publico')?.checked || false,
            descricao: document.getElementById('descricao')?.value.trim(),
            capa: document.getElementById('campaignPreview')?.src
        };
    }

    async submitForm(formData) {
        // Simular envio para o servidor
        console.log('Enviando dados da mesa:', formData);
        
        // Simular delay de rede
        await this.simulateNetworkDelay(2000);
        
        // Simular sucesso (em um sistema real, isso viria da API)
        return { success: true };
    }

    // Métodos estáticos para uso nos painéis (mantidos para compatibilidade)
    static saveAsDraft() {
        const mesa = new MesaForm();
        const formData = mesa.getFormData();
        localStorage.setItem('mesa_draft', JSON.stringify(formData));
        DiceOrDieUtils.showSuccess('Rascunho salvo!');
    }

    static clearForm() {
        if (confirm('Tem certeza que deseja limpar o formulário?')) {
            const form = document.getElementById('mainForm');
            if (form) {
                form.reset();
            }
            
            const campaignPreview = document.getElementById('campaignPreview');
            if (campaignPreview) {
                campaignPreview.src = 'https://placehold.co/150x150/666/fff?text=Capa';
            }
            
            const publicoLabel = document.getElementById('publicoLabel');
            if (publicoLabel) {
                publicoLabel.textContent = 'Sim';
            }
            
            DiceOrDieUtils.showSuccess('Formulário limpo!');
        }
    }

    static loadDraft() {
        const draft = localStorage.getItem('mesa_draft');
        if (draft) {
            try {
                const data = JSON.parse(draft);
                
                // Preencher campos com dados do rascunho
                Object.keys(data).forEach(key => {
                    const field = document.getElementById(key);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = data[key];
                        } else {
                            field.value = data[key];
                        }
                    }
                });

                // Atualizar preview da capa se existir
                if (data.capa) {
                    const campaignPreview = document.getElementById('campaignPreview');
                    if (campaignPreview) {
                        campaignPreview.src = data.capa;
                    }
                }

                // Atualizar label do toggle público
                const publicoLabel = document.getElementById('publicoLabel');
                const publicoToggle = document.getElementById('publico');
                if (publicoLabel && publicoToggle) {
                    publicoLabel.textContent = publicoToggle.checked ? 'Sim' : 'Não';
                }

                DiceOrDieUtils.showSuccess('Rascunho carregado!');
            } catch (error) {
                console.error('Erro ao carregar rascunho:', error);
                DiceOrDieUtils.showError('Erro ao carregar rascunho.');
            }
        } else {
            DiceOrDieUtils.showError('Nenhum rascunho encontrado.');
        }
    }
}

// Use standardized form initializer
FormInitializer.initializeForm(MesaForm, 'mesa');
