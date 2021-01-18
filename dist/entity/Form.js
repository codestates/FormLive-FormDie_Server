"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = void 0;
var typeorm_1 = require("typeorm");
var Relation_1 = require("./Relation");
var Userform_1 = require("./Userform");
var Form = /** @class */ (function () {
    function Form() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Form.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], Form.prototype, "title", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], Form.prototype, "description", void 0);
    __decorate([
        typeorm_1.CreateDateColumn({
            name: "created_at"
        }),
        __metadata("design:type", Date)
    ], Form.prototype, "createdAt", void 0);
    __decorate([
        typeorm_1.UpdateDateColumn({
            name: "updated_at"
        }),
        __metadata("design:type", Date)
    ], Form.prototype, "updatedAt", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Relation_1.Relation; }, function (relation) { return relation.form; }),
        __metadata("design:type", Array)
    ], Form.prototype, "relations", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Userform_1.Userform; }, function (userform) { return userform.form; }),
        __metadata("design:type", Array)
    ], Form.prototype, "userforms", void 0);
    Form = __decorate([
        typeorm_1.Entity()
    ], Form);
    return Form;
}());
exports.Form = Form;
//# sourceMappingURL=Form.js.map