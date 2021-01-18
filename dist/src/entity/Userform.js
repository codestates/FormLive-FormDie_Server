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
exports.Userform = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var Form_1 = require("./Form");
var Userform = /** @class */ (function () {
    function Userform() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Userform.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Userform.prototype, "userId", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Userform.prototype, "formId", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", String)
    ], Userform.prototype, "contents", void 0);
    __decorate([
        typeorm_1.Column('boolean', { default: false }),
        __metadata("design:type", Boolean)
    ], Userform.prototype, "isComplete", void 0);
    __decorate([
        typeorm_1.CreateDateColumn({
            name: "created_at"
        }),
        __metadata("design:type", Date)
    ], Userform.prototype, "createdAt", void 0);
    __decorate([
        typeorm_1.UpdateDateColumn({
            name: "updated_at"
        }),
        __metadata("design:type", Date)
    ], Userform.prototype, "updatedAt", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return User_1.User; }, function (user) { return user.userforms; }),
        __metadata("design:type", User_1.User)
    ], Userform.prototype, "user", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Form_1.Form; }, function (form) { return form.userforms; }),
        __metadata("design:type", Form_1.Form)
    ], Userform.prototype, "form", void 0);
    Userform = __decorate([
        typeorm_1.Entity()
    ], Userform);
    return Userform;
}());
exports.Userform = Userform;
//# sourceMappingURL=Userform.js.map