import { toast, red, green } from "./toast.js"

import { readAll } from "./requests.js"
import { allEmployeesRequest, allDepartmentsRequest, updateDepartment, createDepartment, deleteDepartment, updateEmployee, hireEmployee, deleteEmployee } from "./adminRequests.js"
import { renderSelect, renderEmployes, renderSelectOutWork } from "./adminRender.js"

//segurança da pagina de admin
function authentication() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        location.replace("../../index.html");
    }
}

// sair da pagina e limpar localStorage
function handleLogout() {
    const logout = document.querySelector('.logout')

    logout.addEventListener('click', () => {
        localStorage.removeItem('authToken');

        location.replace('../../index.html')
    })
}

//fechar Madais
function closeModal() {
    const closeButtons = document.querySelectorAll(".close__button")
    const create = document.querySelector('.dialog__create')
    const look = document.querySelector('.dialog__look')
    const editUser = document.querySelector('.dialog__edit--user')
    const editDep = document.querySelector('.dialog__edit--dep')
    const deleteUser = document.querySelector('.modal__delete--user')
    const deleteDep = document.querySelector('.modal__delete--dep')

    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            look.close()
            editUser.close()
            deleteUser.close()
            create.close()
            editDep.close()
            deleteDep.close()
        });
    });
}

//Abrir modal para criar departamento
async function handleCreate() {
    const modal = document.querySelector('.dialog__create')
    const button = document.querySelector('.create')
    const select = document.querySelector('.select__company')

    const campanies = await readAll()

    //renderizar os departamentos no select
    campanies.forEach(company => {
        const option = document.createElement('option')
        option.value = company.id
        option.innerText = company.name

        select.appendChild(option)
    })

    button.addEventListener('click', () => {
        modal.showModal()

        const inputs = document.querySelectorAll('.create__input')
        const Createbutton = document.querySelector('.create__button')

        Createbutton.addEventListener('click', async () => {
            let createBody = {}
            let count = 0

            //pegando o valor os inputs
            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    count++
                }
                createBody[input.name] = input.value
            })

            //pegando o valor do select
            const value = select.value
            if (value === '') {
                count++
            }
            createBody[select.name] = value

            if (count !== 0) {
                count = 0
                return toast(red, 'Por favor preencha todos os campos')
            } else {
                await createDepartment(createBody)
                modal.close()
                toast(green, 'Departamento criado com sucesso')
                renderSelect()
            }
        })
        closeModal()
    })
}

//Abrir modal para ver o departamento e contratar
export async function handleLookDepartment() {
    const modal = document.querySelector('.dialog__look')
    const buttons = document.querySelectorAll('.dep__look')
    const departments = await allDepartmentsRequest() // todos os departamentos
    const companies = await readAll() // todas as empresas, verificar com id
    const departmentName = document.querySelector('.depart__name')
    const departmentDescription = document.querySelector('.depart__description')
    const DepartmentCompany = document.querySelector('.owned__company')
    const select = document.querySelector('.select__user')
    const hireButton = document.querySelector('.hire__button')
    const opcoes = document.querySelectorAll('.select__user > option ')

    //pegando todos os botoes de olho e adicionando as funções
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            modal.showModal()
            await renderSelectOutWork()

            const departmentId = button.value

            //renderizar o nome do departamento no modal
            const departmentObject = departments.find(department => department.id == departmentId)
            departmentName.innerText = departmentObject.name
            departmentDescription.innerText = departmentObject.description

            //renderizar nome da empresa
            const companyID = departmentObject.company_id
            const companyObject = companies.find(company => company.id == companyID)
            DepartmentCompany.innerText = companyObject.name

            //renderizar os funcionarios daqueles departamento
            await renderEmployes(departmentId)

            //request contratar para aquele setor
            hireButton.addEventListener('click', async () => {
                const hireBody = {
                    "department_id": `${departmentId}`
                }
                const idEmployed = select.value

                if (idEmployed == '') {
                    return toast(red, 'Por favor selecione alguma opção')
                } else {
                    await hireEmployee(idEmployed, hireBody)
                    await renderEmployes(departmentId)
                    await renderSelectOutWork()
                    renderSelect()
                }
            })

            closeModal()
        })

    })
}

//Abrir modal para editar a descrição do departamento
export async function handleEditDepartment() {
    const buttons = document.querySelectorAll('.dep__edit')

    const modal = document.querySelector('.dialog__edit--dep')
    const input = document.querySelector('.edit__department')
    const editButton = document.querySelector('.button__edit--dep')

    const departments = await allDepartmentsRequest()

    //pegando todos os botoes de edite e adicionando as funções
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            modal.showModal()

            const departmentId = button.value

            //request editar
            editButton.addEventListener('click', async () => {

                const description = input.value

                if (description.trim() === '') {
                    return toast(red, 'Por favor preencha todos os campos')
                }

                //pegar o nome do departamento
                const departmentObject = departments.find(department => departmentId == department.id)
                const departmentName = departmentObject.name

                //body do edit
                const updateBody = {
                    "description": `${description}`,
                    "name": `${departmentName}`
                }

                await updateDepartment(departmentId, updateBody)
                modal.close()
                toast(green, 'Departamento editado')
                renderSelect()
            })

            closeModal()
        })

    })
}

//abrir modal para deletar o departamento
export async function handleDeleteDepartment() {
    const buttons = document.querySelectorAll('.dep__delete')

    const modal = document.querySelector('.modal__delete--dep')
    const name = document.querySelector('.delete__name--dep')
    const deleteButton = document.querySelector('.button__delete--department')

    const departments = await allDepartmentsRequest()

    //pegando todos os botoes de edite e adicionando as funções
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            modal.showModal()

            const departmentId = button.value

            //renderizar o nome do departamento
            departments.forEach(depart => {
                if (depart.id == departmentId) {
                    name.innerText = `Realmente deseja remover o ${depart.name} e demitir seus funcionários?`
                }
            });

            //request editar
            deleteButton.addEventListener('click', async () => {
                await deleteDepartment(departmentId)
                modal.close()
                toast(green, 'Departamento deletado')
                renderSelect()
            })
        })

        closeModal()
    })
}

//Abrir modal para editar a descrição do departamento
export async function handleEditUser() {
    const buttons = document.querySelectorAll('.user__edit')

    const modal = document.querySelector('.dialog__edit--user')
    const inputs = document.querySelectorAll('.edit__user')
    const editButton = document.querySelector('.button__edit--user')
    let editBody = {}
    let count = 0

    //pegando todos os botoes de edite e adicionando as funções
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            modal.showModal()

            const employeeId = button.value

            editButton.addEventListener('click', async () => {

                inputs.forEach(input => {
                    if (input.value.trim() === '') {
                        count++
                    }

                    editBody[input.name] = input.value
                })

                if (count !== 0) {
                    count = 0
                    return toast(red, 'Por favor preencha todos os campos')
                }

                await updateEmployee(employeeId, editBody)
                modal.close()
                renderSelect()
            })

            closeModal()
        })

    })
}

//abrir modal para deletar o usuario
export async function handleDeleteUser() {
    const buttons = document.querySelectorAll('.user__trash')

    const modal = document.querySelector('.modal__delete--user')
    const deleteButton = document.querySelector('.button__delete--user')
    const name = document.querySelector('.delete__name--user')

    const employees = await allEmployeesRequest()

    //pegando todos os botoes de edite e adicionando as funções
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            modal.showModal()

            const employeeId = button.value
            employees.forEach(emp => {
                if (emp.id == employeeId) {
                    name.innerText = "Realmente deseja remover o usuário " + emp.name + "?"
                }
            })

            //request editar
            deleteButton.addEventListener('click', async () => {
                await deleteEmployee(employeeId)
                modal.close()
                toast(green, 'Usuario deletado com sucesso')
                renderSelect()
            })

            closeModal()
        })

    })
}

authentication()
handleLogout()
renderSelect()
handleCreate()
