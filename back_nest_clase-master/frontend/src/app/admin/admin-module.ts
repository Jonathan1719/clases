import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Perfil } from './components/perfil/perfil';
import { Producto } from './inventario/components/producto/producto';
import { Categoria } from './inventario/components/categoria/categoria';
import { Cliente } from './components/cliente/cliente';
import { ListaPedido } from './pedido/components/lista-pedido/lista-pedido';
import { NuevoPedido } from './pedido/components/nuevo-pedido/nuevo-pedido';


@NgModule({
  declarations: [
    Perfil,
    Producto,
    Categoria,
    Cliente,
    ListaPedido,
    NuevoPedido
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
