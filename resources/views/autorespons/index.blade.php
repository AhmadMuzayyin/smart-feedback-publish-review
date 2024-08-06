@extends('layouts.admin')

@section('main-content')
    <!-- Page Heading -->
    <h1 class="h3 mb-4 text-gray-800">{{ __('Jawaban Otomatis') }}</h1>

    @if (session('success'))
        <div class="alert alert-success border-left-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    @if ($errors->any())
        <div class="alert alert-danger border-left-danger" role="alert">
            <ul class="pl-4 my-2">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="row">
        <div class="col-lg-12 order-lg-1">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Jawaban Otomatis</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped" id="table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Ulasan</th>
                                    <th>Sentimen</th>
                                    <th>Jawaban</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($autoresponse as $item)
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>

    </div>

@endsection
@push('js')
    <script src="https://js.pusher.com/8.0.1/pusher.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
    <script>
        // datatable
        const table = $('#table').DataTable({
            processing: true,
            autoWidth: false,
            ajax: {
                "url": 'http://localhost:3000/autorespons',
                "dataSrc": ""
            },
            columns: [{
                    data: 'reviewer_name',
                    name: 'reviewer_name',
                    width: '20%'
                },
                {
                    data: 'text',
                    name: 'text',
                    width: '40%'
                },
                {
                    data: 'sentiment',
                    render: (data) => {
                        return `(${data.score}) ` + data.label;
                    },
                    width: '10%'
                },
                {
                    data: 'owners_response',
                    name: 'owners_response',
                    width: '30%',
                    render: (data, type, row) => {
                        var html =
                            `<textarea class="form-control" id="response-${row.id}" rows="3" readonly>${data}</textarea>`;
                        return html;
                    }
                },
            ],
            columnDefs: [{
                targets: '_all',
                className: 'text-wrap'
            }]
        });
        $('head').append(`
            <style>
                .dataTables_wrapper .dataTables_length, 
                .dataTables_wrapper .dataTables_filter, 
                .dataTables_wrapper .dataTables_info, 
                .dataTables_wrapper .dataTables_paginate {
                    display: none;
                }
                .text-wrap {
                    white-space: normal;
                    word-wrap: break-word;
                }
                table.dataTable td {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            </style>
        `);
        // pusher
        Pusher.logToConsole = false;
        setInterval(() => {
            pusherRun()
        }, 10000);

        function pusherRun() {
            var pusher = new Pusher("2b611c879d009c74d202", {
                cluster: "ap1",
            });
            var channel = pusher.subscribe('new-reviews');
            channel.bind('update', function(data) {
                table.ajax.reload();
                toastr.success('New review has been added');
            });
        }
    </script>
@endpush
